export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(to bottom right, var(--color-primary-dark, #025a87), var(--color-primary, #038ed3))',
      }}
    >
      {children}
    </div>
  )
}
