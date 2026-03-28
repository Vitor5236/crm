import { NavLink, Outlet } from 'react-router-dom';
import {
  Users,
  Calendar,
  UserPlus,
  Star,
  Shield,
  Wrench,
  Heart,
  Gift,
  Settings,
  DollarSign,
  MessageSquare,
  FileText,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavSection {
  title: string;
  icon: React.ReactNode;
  items: { label: string; path: string; icon: React.ReactNode }[];
}

const navSections: NavSection[] = [
  {
    title: 'Atendimento & Pre-Venda',
    icon: <Users className="w-5 h-5" />,
    items: [
      { label: 'Clientes', path: '/clients', icon: <Users className="w-4 h-4" /> },
      { label: 'Agendamentos', path: '/visits', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Captacao de Leads', path: '/leads', icon: <UserPlus className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Pos-Venda & Fidelizacao',
    icon: <Heart className="w-5 h-5" />,
    items: [
      { label: 'Pesquisas de Satisfacao', path: '/surveys', icon: <Star className="w-4 h-4" /> },
      { label: 'Garantias', path: '/warranties', icon: <Shield className="w-4 h-4" /> },
      { label: 'Manutencao Preventiva', path: '/maintenance', icon: <Wrench className="w-4 h-4" /> },
      { label: 'Programa de Fidelidade', path: '/loyalty', icon: <Gift className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Administrativo',
    icon: <Settings className="w-5 h-5" />,
    items: [
      { label: 'Usuarios', path: '/users', icon: <Users className="w-4 h-4" /> },
      { label: 'Servicos e Precos', path: '/services', icon: <DollarSign className="w-4 h-4" /> },
      { label: 'Politica de Descontos', path: '/discounts', icon: <DollarSign className="w-4 h-4" /> },
      { label: 'Templates de Mensagens', path: '/templates', icon: <MessageSquare className="w-4 h-4" /> },
      { label: 'Logs de Atividade', path: '/logs', icon: <FileText className="w-4 h-4" /> },
    ],
  },
];

export default function Layout() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Atendimento & Pre-Venda': true,
    'Pos-Venda & Fidelizacao': true,
    'Administrativo': true,
  });

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-72 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">Gestão Pro</h1>
          <p className="text-slate-400 text-sm mt-1">Gestao de Clientes</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                isActive ? 'bg-slate-800 text-white border-r-2 border-emerald-500' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>

          {navSections.map((section) => (
            <div key={section.title} className="mt-2">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-6 py-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </span>
                {expandedSections[section.title] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {expandedSections[section.title] && (
                <div className="mt-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 pl-12 pr-6 py-2.5 text-sm transition-colors ${
                          isActive
                            ? 'bg-slate-800 text-white border-r-2 border-emerald-500'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-400">Sistema CRM v1.0</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-72">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Bem-vindo</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
