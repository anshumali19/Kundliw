import { Play } from "lucide-react";

/** Small "Watch video" marker shown on a service or plan that has a video. Pass href to make it a link. */
export function WatchVideoBadge({ isHindi, href, className = "" }: { isHindi: boolean; href?: string; className?: string }) {
  const classes = `inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary ${className}`;
  const body = (
    <>
      <Play className="h-3 w-3 fill-current" aria-hidden="true" />
      {isHindi ? "वीडियो देखें" : "Watch video"}
    </>
  );
  return href ? (
    <a href={href} className={`${classes} hover:bg-primary/20`}>
      {body}
    </a>
  ) : (
    <span className={classes}>{body}</span>
  );
}
