import config from "../../config.json";
let changeLog: { content: Array<ChangeLogItem> };
if (config.target === "public") {
  changeLog = (await import("../../../changelog.json")).default;
} else {
  changeLog = (await import("../../../changelog_finngen.json")).default;
}
import { ChangeLogItem } from "../../types/types";

const renderContent = (content: Array<ChangeLogItem>) => {
  return (
    <>
      {content.map((item, index) => {
        switch (item.type) {
          case "span":
            return (
              <span key={index}>
                {item.text}
                {item.children && renderContent(item.children)}
              </span>
            );
          case "ul":
            return <ul key={index}>{item.children && renderContent(item.children)}</ul>;
          case "li":
            return <li key={index}>{item.text}</li>;
          default:
            return null;
        }
      })}
    </>
  );
};

const ChangeLog = () => {
  return renderContent(changeLog.content);
};

export default ChangeLog;
