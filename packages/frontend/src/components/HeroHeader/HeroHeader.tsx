import "./HeroHeader.css";

interface HeroHeaderProps {
  videoSrc: string;
  title?: string;
  subtitle?: string;
  overlayOpacity?: number;
}

function HeroHeader({
  videoSrc,
  title,
  subtitle,
  overlayOpacity = 0.5,
}: HeroHeaderProps) {
  return (
    <header className="hero-header">
      <video className="hero-video" autoPlay muted loop playsInline>
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div
        className="hero-overlay"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
      />
      <div className="hero-content">
        {title && <h1 className="hero-title">{title}</h1>}
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}

export default HeroHeader;
