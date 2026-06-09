import Image from "next/image";

interface NewsListItemProps {
  title: string;
  statusColor: "#20C745" | "#F45252";
  arrowIconPath: string;
}

const STATUS_GREEN = "bg-[#20C745]";
const STATUS_RED = "bg-[#F45252]";
const TEXT_COLOR = "text-black";

const NewsListItem: React.FC<NewsListItemProps> = ({
  title,
  statusColor,
  arrowIconPath,
}) => {
  const statusClass = statusColor === "#20C745" ? STATUS_GREEN : STATUS_RED;

  return (
    <div
      className={`flex items-center justify-between cursor-pointer border-b border-black hover:bg-gray-50 transition-colors duration-150`}
      style={{ height: "82px" }}
      aria-label={`Visualizar notícia: ${title}`}
    >
      <div className="flex items-center">
        <div
          className={`w-3 h-3 rounded-full ${statusClass}`}
          style={{ marginLeft: "0px" }}
        />

        <p
          className={`text-[26px] font-medium ${TEXT_COLOR} m-0 truncate`}
          style={{
            marginLeft: "14px",
            fontSize: "26px",
            fontWeight: 500,
          }}
        >
          {title}
        </p>
      </div>

      <div style={{ marginRight: "0px" }}>
        {" "}
        <Image
          src={arrowIconPath}
          alt="Seta para direita"
          width={32}
          height={32}
          className="w-8 h-8"
        />
      </div>
    </div>
  );
};

export default NewsListItem;
