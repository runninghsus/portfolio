import { site } from "@/data/site";
import ExtIcon from "@/components/ExtIcon";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap inner">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <a href={site.links.github} target="_blank" rel="noopener noreferrer">
          GitHub
          <ExtIcon />
        </a>
      </div>
    </footer>
  );
}
