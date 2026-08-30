import { useEffect, useState } from 'react';
import { Search, FileText, User, Calendar, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ActivityLog } from '../types/database';

export default function Logs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

  const actions = [...new Set(logs.map((l) => l.action))];
  const entities = [
    ...new Set(logs.map((l) => l.entity_type).filter((e): e is string => Boolean(e))),
  ];

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('insert')) return 'bg-emerald-100 text-emerald-700';
    if (action.includes('update') || action.includes('edit')) return 'bg-blue-100 text-blue-700';
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700';
  };

  const getEntityIcon = (entity: string | null) => {
    switch (entity) {
      case 'clients':
        return 'Clientes';
      case 'visits':
        return 'Agendamentos';
      case 'leads':
        return 'Leads';
      case 'surveys':
        return 'Pesquisas';
      case 'warranties':
        return 'Garantias';
      case 'maintenance_plans':
        return 'Manutencoes';
      case 'services':
        return 'Servicos';
      case 'discounts':
        return 'Descontos';
      case 'templates':
        return 'Templates';
      case 'users':
        return 'Usuarios';
      default:
        return entity || 'Sistema';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Logs de Atividade</h1>
          <p className="text-slate-600 mt-1">Historico de acoes no sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total de Registros</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{logs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Criacoes</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {logs.filter((l) => l.action.includes('create') || l.action.includes('insert')).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Atualizacoes</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {logs.filter((l) => l.action.includes('update') || l.action.includes('edit')).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Exclusoes</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {logs.filter((l) => l.action.includes('delete') || l.action.includes('remove')).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar nos logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Todas as Acoes</option>
                  {actions.map((action) => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Todas as Entidades</option>
                {entities.map((entity) => (
                  <option key={entity} value={entity}>{getEntityIcon(entity)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="p-8 text-center text-slate-500">Nenhum log encontrado</p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <FileText className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        {log.entity_type && (
                          <span className="text-sm text-slate-600">
                            em {getEntityIcon(log.entity_type)}
                          </span>
                        )}
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <pre className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded overflow-x-auto max-w-lg">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(log.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(log.created_at), "HH:mm:ss")}
                    </div>
                    {log.user_id && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <User className="w-3 h-3" />
                        {log.user_id.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
