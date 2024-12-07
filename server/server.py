import json
import sys
import timeit
from typing import Any, Callable, Literal
from flask import (
    Flask,
    flash,
    jsonify,
    render_template,
    request,
    session,
    redirect,
    url_for,
)
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user  # type: ignore
from flask_compress import Compress  # type: ignore
import imp
import logging
import re

import werkzeug
from exceptions import (
    ACZeroException,
    DataException,
    GeneNotFoundException,
    ParseException,
    VariantNotFoundException,
)
from data_access.assoc import Datafetch
from data_access.gnomad import GnomAD
from data_access.rsid_db import RsidDB
from data_access.finemapped import Finemapped
from data_access.metadata import Metadata
from datatypes import ResponseTime
from variant import Variant
from group_based_auth import verify_membership, GoogleSignIn, before_request
from collections import defaultdict as dd

app = Flask(__name__, template_folder="../templates", static_folder="../static")
Compress(app)

try:
    _conf_module = imp.load_source("config", "config.py")
except Exception:
    app.logger.error("Could not load config.py from the current directory")
    sys.exit(1)
config = {
    key: getattr(_conf_module, key)
    for key in dir(_conf_module)
    if not key.startswith("_")
}

app.config["SECRET_KEY"] = (
    config["SECRET_KEY"] if "SECRET_KEY" in config else "nonsecret key"
)

gunicorn_logger = logging.getLogger("gunicorn.error")
app.logger.handlers = gunicorn_logger.handlers
app.logger.setLevel(config["log_level"])

sep_re_line = re.compile("[\r\n|\n]+")
sep_re_delim = re.compile("[\s|\t|,]+")
sep_re_line_and_delim = re.compile("[\r\n|\n|\s|\t|,]+")

fetch = Datafetch(config)
fetch_finemapped = Finemapped(config)
meta = Metadata(config)
gnomad_fetch = GnomAD(config)
rsid_db = RsidDB(config)

GENEUPPER2RANGE = {}
with open(config["gene_chr_pos"], "r") as f:
    for line in f:
        s = line.strip().split("\t")
        GENEUPPER2RANGE[s[0].upper()] = (s[1], int(s[2]), int(s[3]))


def get_gene_range(gene: str) -> tuple[str, int, int]:
    if gene.upper() not in GENEUPPER2RANGE:
        raise GeneNotFoundException(f"Gene {gene} not found")
    return GENEUPPER2RANGE[gene.upper()]


coding_set = set(
    [
        "missense",
        "frameshift",
        "inframe insertion",
        "inframe deletion",
        "transcript ablation",
        "stop gained",
        "stop lost",
        "start lost",
        "splice acceptor",
        "splice donor",
        "incomplete terminal codon",
        "protein altering",
        "coding sequence",
    ]
)


def parse_query(
    query: str,
) -> tuple[Literal["single", "group"], list[tuple[str, float, str | None]]]:
    items = sep_re_line.split(query)
    len_first = len(sep_re_delim.split(items[0]))
    if len_first > 1:  # input has betas and possibly groups attached
        input = []
        try:
            for line in items:
                s = sep_re_delim.split(line)
                if s[0] != "":
                    input.append(
                        (
                            s[0],
                            float(s[1]),
                            s[2] if len_first > 2 else None,
                        )
                    )
        except IndexError:
            raise ParseException(
                "Oops, I cannot parse that. Try providing either one variant per line or all variants in one line separated by space or comma. Or variant, beta, and optionally any custom value separated by space or comma on each line."
            )
        except ValueError as e:
            raise ParseException(
                "Oops, I cannot parse that. Looks like some beta value is not numeric in the input: "
                + str(e)
            )
        return ("group", input)
    else:
        items = sep_re_line_and_delim.split(query)
        vars: list[str] = list(dict.fromkeys([item.strip() for item in items]))
        input = [
            (var, 0, None) for var in vars if var != ""
        ]  # would like to use None instead of 0 but mypy complains and I don't know how to fix it
        return ("single", input)


def is_public(function: Callable[..., Any]) -> Callable[..., Any]:
    function.is_public = True  # type: ignore
    return function


@app.before_request
def check_auth() -> werkzeug.wrappers.Response | None:
    # check if endpoint is mapped then
    # check if endpoint has is_public annotation
    if (
        request.endpoint
        and (request.endpoint in app.view_functions)
        and getattr(app.view_functions[request.endpoint], "is_public", False)
    ):
        result = None
    else:  # check authentication
        result = before_request()
    return result


@app.route("/healthz")
@is_public
def healthz() -> Any:
    return jsonify({"status": "ok!"})


@app.route("/auth")
@is_public
def auth() -> str:
    return render_template("auth.html")


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def homepage(path: str) -> str:
    return render_template("index.html")


@app.route("/api/v1/config", methods=["GET"])
def get_config() -> Any:
    return jsonify(
        {
            "gnomad": config["gnomad"],
            "assoc": config["assoc"],
            "finemapped": config["finemapped"],
        }
    )


def looks_like_a_gene(query: str) -> bool:
    items = [item for item in sep_re_line.split(query) if item.strip() != ""]
    if len(items) != 1:
        return False
    try:
        _ = Variant(items[0])
    except ParseException:
        return True
    return False


@app.route("/api/v1/results", methods=["POST"])
def results() -> Any | tuple[Any, int]:
    start_time = timeit.default_timer()
    query = request.json[
        "variants"
    ].strip()  # TODO this shouldn't be called "variants" now that it may be a gene too
    if looks_like_a_gene(query):
        return gene_results(query)
    try:
        parsed = parse_query(query)
    except ParseException as e:
        return jsonify({"message": str(e)}), 400

    if len(parsed[1]) > config["max_query_variants"]:
        app.logger.warn(str(len(parsed[1])) + " variants given, too much")
        return (
            jsonify(
                {
                    "message": "a maximum of "
                    + str(config["max_query_variants"])
                    + " variants are accepted"
                }
            ),
            400,
        )

    time: ResponseTime = {"gnomad": 0, "finemapped": 0, "assoc": 0, "total": 0}
    uniq_most_severe: set[str] = set()
    uniq_phenos: set[tuple[str, str, str, str]] = set()
    uniq_datasets: set[str] = set()
    data = []
    found_input_variants = set()
    found_actual_variants = set()
    unparsed_variants = set()
    notfound_variants = set()
    ac0_variants = set()
    rsid_map = dd(list)
    for tpl in parsed[1]:
        try:
            vars = [Variant(tpl[0])]
        except ParseException as e:
            try:
                vars = rsid_db.get_variants_by_rsid(tpl[0])
            except ParseException as e:
                unparsed_variants.add(tpl[0])
                continue
            if len(vars) == 0:
                notfound_variants.add(tpl[0])
                continue
        for var in vars:
            if str(var) in found_actual_variants:
                continue
            try:
                gnomad = gnomad_fetch.get_gnomad(var)
            except VariantNotFoundException as e:
                notfound_variants.add(str(var))
                continue
            except ACZeroException as e:
                ac0_variants.add(str(var))
                continue
            try:
                finemapped = fetch_finemapped.get_finemapped(var)
                assoc = fetch.get_assoc_and_ld_assoc(var)
            except DataException as e:
                return jsonify({"message": str(e)}), 500
            data.append(
                {
                    "variant": str(var),
                    "beta": tpl[1],
                    "value": tpl[2],
                    "gnomad": gnomad["gnomad"],
                    "finemapped": finemapped["finemapped"],
                    "assoc": assoc["assoc"],
                }
            )
            found_input_variants.add(tpl[0])
            found_actual_variants.add(str(var))
            rsid_map[tpl[0]].append(str(var))
            time["gnomad"] += gnomad["time"]
            time["finemapped"] += finemapped["time"]
            time["assoc"] += assoc["time"]
            uniq_phenos.update(
                [
                    (a["data_type"], a["resource"], a["dataset"], a["phenocode"])
                    for a in assoc["assoc"]["data"] + finemapped["finemapped"]["data"]
                ]
            )
            uniq_datasets.update(
                a["dataset"]
                for a in assoc["assoc"]["data"] + finemapped["finemapped"]["data"]
            )
            for type in ["exomes", "genomes"]:
                if type in gnomad["gnomad"] and gnomad["gnomad"][type] is not None:
                    uniq_most_severe.add(gnomad["gnomad"][type]["most_severe"])
    try:
        freq_summary = gnomad_fetch.summarize_freq(data)
    except IndexError as e:
        app.logger.error(e)
        freq_summary = []

    try:
        # use resource:phenocode as key
        # note that for eQTL Catalogue leafcutter, phenocode is dataset:phenocode
        phenos = {
            pheno[1]
            + ":"
            + pheno[3]: meta.get_phenotype(pheno[0], pheno[1], pheno[2], pheno[3])
            for pheno in uniq_phenos
        }
    except DataException as e:
        app.logger.error(e)
        return jsonify({"message": str(e)}), 500
    datasets = {
        ds["dataset_id"]: ds
        for ds in [meta.get_dataset(dataset) for dataset in uniq_datasets]
        if ds is not None
    }
    time["total"] = timeit.default_timer() - start_time
    return jsonify(
        {
            "data": data,
            "most_severe": sorted(list(uniq_most_severe)),
            "phenos": phenos,
            "datasets": datasets,
            "freq_summary": freq_summary,
            "has_betas": parsed[0] == "group",
            "has_custom_values": parsed[1][0][2] is not None,
            "input_variants": {
                "found": sorted(list(found_input_variants)),
                "not_found": sorted(list(notfound_variants)),
                "ac0": sorted(list(ac0_variants)),
                "unparsed": sorted(list(unparsed_variants)),
                "rsid_map": rsid_map,
            },
            "meta": {
                "gnomad": config["gnomad"],
                "assoc": config["assoc"],
                "finemapped": config["finemapped"],
            },
            "query_type": "variant",
            "time": time,
        }
    )


# @app.route("/api/v1/gene_results/<gene>", methods=["GET"])
def gene_results(gene: str) -> Any | tuple[Any, int]:
    start_time = timeit.default_timer()
    try:
        tabix_range = get_gene_range(gene)
    except GeneNotFoundException as e:
        return jsonify({"message": str(e)}), 404
    tabix_range_str = f"{tabix_range[0]}:{tabix_range[1]}-{tabix_range[2]}"
    time: ResponseTime = {"gnomad": 0, "finemapped": 0, "assoc": 0, "total": 0}
    uniq_most_severe: set[str] = set()
    uniq_phenos: set[tuple[str, str, str, str]] = set()
    uniq_datasets: set[str] = set()
    data = []
    try:
        gnomad = gnomad_fetch.get_gnomad_range(tabix_range_str, gene)
    except VariantNotFoundException as e:
        return jsonify({"message": f"No variants found for gene {gene}"}), 404
    try:  # TODO only parse variants that are in the gnomad result set for speedup
        finemapped = fetch_finemapped.get_finemapped_range(tabix_range_str)
        assoc = fetch.get_assoc_range(tabix_range_str)
    except DataException as e:
        return jsonify({"message": str(e)}), 500
    for variant in gnomad["gnomad"]:
        if gnomad["gnomad"][variant]["exomes"] is not None:
            csq = gnomad["gnomad"][variant]["exomes"]["consequences"]
            for c in csq:
                if (
                    (
                        "gene_symbol" not in c
                        or c["gene_symbol"] is None
                        or c["gene_symbol"].upper() == gene.upper()
                    )
                    and c["consequence"] in coding_set
                    and (
                        variant in finemapped["finemapped"]["data"]
                        or variant in assoc["assoc"]["data"]
                    )
                ):
                    data.append(
                        {
                            "variant": variant,
                            "gnomad": gnomad["gnomad"][variant],
                            "finemapped": (
                                finemapped["finemapped"]["data"][variant]
                                if variant in finemapped["finemapped"]["data"]
                                else {"data": [], "resources": []}
                            ),
                            "assoc": (
                                assoc["assoc"]["data"][variant]
                                if variant in assoc["assoc"]["data"]
                                else {"data": [], "resources": []}
                            ),
                        }
                    )
                    uniq_phenos.update(
                        [
                            (
                                a["data_type"],
                                a["resource"],
                                a["dataset"],
                                a["phenocode"],
                            )
                            for a in assoc["assoc"]["data"][variant]["data"]
                            + finemapped["finemapped"]["data"][variant]["data"]
                        ]
                    )
                    uniq_datasets.update(
                        a["dataset"]
                        for a in assoc["assoc"]["data"][variant]["data"]
                        + finemapped["finemapped"]["data"][variant]["data"]
                    )
                    for type in ["exomes", "genomes"]:
                        if (
                            type in gnomad["gnomad"]
                            and gnomad["gnomad"][type] is not None
                        ):
                            uniq_most_severe.add(gnomad["gnomad"][type]["most_severe"])
                    break
    try:
        freq_summary = gnomad_fetch.summarize_freq(data)
    except IndexError as e:
        app.logger.error(e)
        freq_summary = []
    time["gnomad"] += gnomad["time"]
    time["finemapped"] += finemapped["time"]
    time["assoc"] += assoc["time"]

    try:
        # use resource:phenocode as key
        # note that for eQTL Catalogue leafcutter, phenocode is dataset:phenocode
        phenos = {
            pheno[1]
            + ":"
            + pheno[3]: meta.get_phenotype(pheno[0], pheno[1], pheno[2], pheno[3])
            for pheno in uniq_phenos
        }
    except DataException as e:
        app.logger.error(e)
        return jsonify({"message": str(e)}), 500
    datasets = {
        ds["dataset_id"]: ds
        for ds in [meta.get_dataset(dataset) for dataset in uniq_datasets]
        if ds is not None
    }
    time["total"] = timeit.default_timer() - start_time
    return jsonify(
        {
            "data": data,
            "most_severe": sorted(list(uniq_most_severe)),
            "phenos": phenos,
            "datasets": datasets,
            "freq_summary": freq_summary,
            "has_betas": False,
            "has_custom_values": False,
            "meta": {
                "gnomad": config["gnomad"],
                "assoc": config["assoc"],
                "finemapped": config["finemapped"],
            },
            "query_type": "gene",
            "time": time,
        }
    )


# OAUTH2
if config["authentication"]:
    with open(config["authentication_file"]) as f:
        auth_json = json.load(f)
    google_sign_in = GoogleSignIn()

    lm = LoginManager(app)
    lm.login_view = "homepage"

    class User(UserMixin):  # type: ignore
        "A user's id is their email address."

        def __init__(
            self, username: str | None = None, email: str | None = None
        ) -> None:
            self.username = username
            self.email = email

        def get_id(self) -> str | None:
            return self.email

        def __repr__(self) -> str:
            return "<User email={!r}>".format(self.email)

    @lm.user_loader  # type: ignore
    def load_user(id: str) -> User | None:
        if id.endswith("@finngen.fi") or id in (
            auth_json["login"]["whitelist"]
            if "whitelist" in auth_json["login"].keys()
            else []
        ):
            return User(email=id)
        return None

    @app.route("/logout")
    @is_public
    def logout() -> werkzeug.wrappers.Response:
        app.logger.info(current_user.email, "logged out")
        logout_user()
        return redirect(url_for("homepage", _scheme="https", _external=True))

    @app.route("/login_with_google")
    @is_public
    def login_with_google() -> werkzeug.wrappers.Response:
        "this route is for the login button"
        session["original_destination"] = url_for(
            "homepage", _scheme="https", _external=True
        )
        return redirect(url_for("get_authorized", _scheme="https", _external=True))

    @app.route("/get_authorized")
    @is_public
    def get_authorized() -> werkzeug.wrappers.Response:
        app.logger.debug("AUTH")
        "This route tries to be clever and handle lots of situations."
        if current_user.is_anonymous or not verify_membership(current_user.email):
            return google_sign_in.authorize()
        else:
            if "original_destination" in session:
                orig_dest = session["original_destination"]
                # We don't want old destinations hanging around.  If this leads to problems with re-opening windows, disable this line.
                del session["original_destination"]
            else:
                orig_dest = url_for("homepage", _scheme="https", _external=True)
            return redirect(orig_dest)

    @app.route("/callback/google")
    @is_public
    def oauth_callback_google() -> werkzeug.wrappers.Response:
        if not current_user.is_anonymous and verify_membership(current_user.email):
            return redirect(url_for("homepage", _scheme="https", _external=True))
        try:
            # oauth.callback reads request.args.
            username, email = google_sign_in.callback()
        except Exception as exc:
            app.logger.error("Error in google_sign_in.callback():")
            app.logger.error(exc)
            flash(
                "Something is wrong with authentication. Please contact humgen-servicedesk@helsinki.fi"
            )
            return redirect(url_for("auth", _scheme="https", _external=True))
        if email is None:
            # I need a valid email address for my user identification
            flash("Authentication failed by failing to get an email address.")
            return redirect(url_for("auth", _scheme="https", _external=True))

        if not verify_membership(email):
            flash(
                "{!r} is not allowed to access FinnGen results. If you think this is an error, please contact humgen-servicedesk@helsinki.fi".format(
                    email
                )
            )
            return redirect(url_for("auth", _scheme="https", _external=True))

        # Log in the user, by default remembering them for their next visit.
        user = User(username, email)
        login_user(user, remember=True)

        app.logger.info(user.email, "logged in")
        return redirect(url_for("get_authorized", _scheme="https", _external=True))


# use run.py instead of running directly, this is here for debugging purposes only
if __name__ == "__main__":
    app.run(port=8080)
