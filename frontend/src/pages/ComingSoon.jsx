import { ArrowLeft, Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';

export default function ComingSoon({ title, description }) { const navigate = useNavigate(); return <div className="mx-auto max-w-3xl"><Card className="flex min-h-[420px] flex-col items-center justify-center text-center"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Construction size={32} /></span><h2 className="mt-6 text-3xl font-black">{title}</h2><p className="mt-3 max-w-md text-navy-700">{description}</p><Button variant="secondary" className="mt-7" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} />Back to dashboard</Button></Card></div>; }
