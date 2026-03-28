import { useEffect, useState } from 'react';
import { Users, Calendar, UserPlus, Star, Shield, Wrench, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Visit, Lead } from '../types/database';

interface Stats {
  totalClients: number;
  totalLeads: number;
  pendingVisits: number;
  avgSatisfaction: number;
  activeWarranties: number;
  dueMaintenance: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalLeads: 0,
    pendingVisits: 0,
    avgSatisfaction: 0,
    activeWarranties: 0,
    dueMaintenance: 0,
  });
  const [upcomingVisits, setUpcomingVisits] = useState<Visit[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        { count: clientsCount },
        { count: leadsCount },
        { count: visitsCount },
        { data: surveys },
        { count: warrantiesCount },
        { count: maintenanceCount },
        { data: visits },
        { data: leads },
      ] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('visits').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('satisfaction_surveys').select('rating'),
        supabase.from('warranties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('maintenance_plans').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('visits').select('*, client:clients(*)').eq('status', 'scheduled').order('scheduled_date', { ascending: true }).limit(5),
        supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const avgRating = surveys?.length
        ? surveys.reduce((acc, s) => acc + s.rating, 0) / surveys.length
        : 0;

      setStats({
        totalClients: clientsCount || 0,
        totalLeads: leadsCount || 0,
        pendingVisits: visitsCount || 0,
        avgSatisfaction: avgRating,
        activeWarranties: warrantiesCount || 0,
        dueMaintenance: maintenanceCount || 0,
      });

      setUpcomingVisits(visits || []);
      setRecentLeads(leads || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total de Clientes', value: stats.totalClients, icon: Users, color: 'bg-blue-500' },
    { label: 'Leads Ativos', value: stats.totalLeads, icon: UserPlus, color: 'bg-emerald-500' },
    { label: 'Visitas Pendentes', value: stats.pendingVisits, icon: Calendar, color: 'bg-amber-500' },
    { label: 'Satisfacao Media', value: stats.avgSatisfaction.toFixed(1), icon: Star, color: 'bg-yellow-500', suffix: '/5' },
    { label: 'Garantias Ativas', value: stats.activeWarranties, icon: Shield, color: 'bg-teal-500' },
    { label: 'Manutencoes Ativas', value: stats.dueMaintenance, icon: Wrench, color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Visao geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {stat.value}
                  {stat.suffix && <span className="text-lg text-slate-500">{stat.suffix}</span>}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Proximas Visitas</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingVisits.length === 0 ? (
              <p className="p-6 text-slate-500 text-center">Nenhuma visita agendada</p>
            ) : (
              upcomingVisits.map((visit) => (
                <div key={visit.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{visit.client?.name || 'Cliente'}</p>
                      <p className="text-sm text-slate-500">{visit.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">
                        {format(new Date(visit.scheduled_date), "dd 'de' MMM", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(visit.scheduled_date), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Leads Recentes</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentLeads.length === 0 ? (
              <p className="p-6 text-slate-500 text-center">Nenhum lead registrado</p>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{lead.name}</p>
                      <p className="text-sm text-slate-500">{lead.interest || 'Interesse nao especificado'}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      lead.status === 'new' ? 'bg-emerald-100 text-emerald-700' :
                      lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                      lead.status === 'qualified' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {lead.status === 'new' ? 'Novo' :
                       lead.status === 'contacted' ? 'Contatado' :
                       lead.status === 'qualified' ? 'Qualificado' :
                       lead.status === 'converted' ? 'Convertido' : 'Perdido'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
