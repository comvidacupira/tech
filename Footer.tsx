import React from "react";

type LinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

const courseLinks: LinkItem[] = [
  { label: "Hardware", href: "/cursos/hardware/" },
  { label: "Windows", href: "/cursos/windows/" },
  { label: "Word", href: "/cursos/word/" },
  { label: "Internet", href: "/cursos/internet/" },
];

const socialLinks: LinkItem[] = [
  { label: "Instagram", href: "https://www.instagram.com/comvidacupira/", external: true },
  { label: "YouTube", href: "https://www.youtube.com/", external: true },
  { label: "Facebook", href: "https://www.facebook.com/", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/", external: true },
];

function renderLink(link: LinkItem) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer">
        {link.label}
      </a>
    );
  }

  return <a href={link.href}>{link.label}</a>;
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div>
          <h3>convida</h3>
          <p>Nesta pagina voce vai encontrar os modulos para sua aprendizagem.</p>
        </div>

        <div>
          <h3>Cursos</h3>
          <ul className="footer-links">
            {courseLinks.map((link) => (
              <li key={link.href}>{renderLink(link)}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Redes Sociais</h3>
          <ul className="footer-links">
            {socialLinks.map((link) => (
              <li key={link.href}>{renderLink(link)}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
