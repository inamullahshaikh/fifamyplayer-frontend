interface FeatureCardProps {
  icon: string
  title: string
  desc: string
}

export default function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="feature-card">
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  )
}

