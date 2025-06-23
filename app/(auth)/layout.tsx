export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0e0e0e] via-[#0e0e0e] to-[#1a0d1f] pointer-events-none" />
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(162,89,255,0.15)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Content container */}
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-[#0e0e0e]/80 backdrop-blur-xl border border-[#2a2a2a] rounded-3xl p-8 shadow-2xl shadow-black/50">
          {children}
        </div>
      </div>
    </div>
  );
} 