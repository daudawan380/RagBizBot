import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="absolute top-4 left-4">
            <Link href="/" className="flex items-center gap-2 text-foreground">
                <Logo className="h-6 w-6" />
                <span className="font-semibold text-lg">RagBizBot</span>
            </Link>
        </div>
      <div className="w-full max-w-md p-4">{children}</div>
    </div>
  );
}
