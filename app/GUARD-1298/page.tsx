import Link from "next/link";
export default function Guard1298Index() {
  return (
    <div className="p-10 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">GUARD-1298: Multi-Language Document Generation via AI</h1>
      <ul className="list-disc pl-5 space-y-2 text-blue-600">
        <li><Link href="/GUARD-1298/settings/organization">Organization Settings</Link></li>
        <li><Link href="/GUARD-1298/jha/new">Create JHA Wizard</Link></li>
        <li><Link href="/GUARD-1298/jha/123">JHA Details (Language Switcher)</Link></li>
        <li><Link href="/GUARD-1298/public/qr/123">Public Access QR View</Link></li>
      </ul>
    </div>
  );
}
