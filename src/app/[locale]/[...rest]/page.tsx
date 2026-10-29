import { notFound } from "next/navigation";

/** Any address that no page matches ends here, so the site's own 404 page (with header and footer) is shown. */
export default function CatchAll() {
  notFound();
}
