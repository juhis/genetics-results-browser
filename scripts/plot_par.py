import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv(
    "/mnt/disks/data/assoc_resources_finngen_version_20240115.chrX.par_anno.stats",
    sep="\t",
    names=["is_par", "resource", "count"],
)

# calculate the relative proportions
df["par_prop"] = df.groupby(["resource", "is_par"])["count"].transform(
    lambda x: x / df["count"].sum()
)

# get the proportions of 'par' and 'nopar' for each resource
pivot_df = df.pivot(index="resource", columns="is_par", values="par_prop")

# normalize the data so that the sum of 'par' and 'nopar' for each item is 1
pivot_df = pivot_df.div(pivot_df.sum(axis=1), axis=0)

pivot_df.plot(kind="bar", stacked=True)
plt.ylabel("par_proportion")
plt.title(
    "Relative proportion of par vs non-par X results p < 0.005 for each resource",
    fontsize=10,
)
plt.xticks(rotation=45, ha="right")
plt.subplots_adjust(bottom=0.15)
plt.tight_layout()
plt.savefig("par_proportion.png")
