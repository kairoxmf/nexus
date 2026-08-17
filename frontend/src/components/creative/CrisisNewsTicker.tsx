import type { CreativeModulesState } from "../../types";
import { useI18n } from "../../i18n";

export function CrisisNewsTicker({ news }: { news?: CreativeModulesState["news_network"] }) {
  const { t } = useI18n();
  if (!news?.live || !news.items.length) return null;

  const current = news.items[news.ticker_index % news.items.length];

  return (
    <div className="crisis-news-ticker">
      <span className="crisis-news-live">{t("creative_news_live")}</span>
      <span className={`crisis-news-tag tag-${current.priority}`}>{current.tag}</span>
      <span className="crisis-news-text">{current.text}</span>
    </div>
  );
}
