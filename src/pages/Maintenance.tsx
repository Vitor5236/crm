import { useEffect, useState } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, Wrench, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { format, differenceInDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MaintenancePlan, Client } from '../types/database';

export default function Maintenance() {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MaintenancePlan | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    frequency_days: 30,
    last_maintenance: '',
    next_maintenance: '',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data: plansData }, { data: clientsData }] = await Promise.all([
        supabase
          .from('maintenance_plans')
          .select('*, client:clients(*)')
          .order('next_maintenance', { ascending: true }),
        supabase.from('clients').select('*').eq('status', 'active'),
      ]);

      setPlans(plansData || []);
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        last_maintenance: formData.last_maintenance || null,
        next_maintenance: formData.next_maintenance || null,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('maintenance_plans')
          .update(payload)
          .eq('id', editingPlan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('maintenance_plans').insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleEdit = (plan: MaintenancePlan) => {
    setEditingPlan(plan);
    setFormData({
      client_id: plan.client_id,
      name: plan.name,
      frequency_days: plan.frequency_days,
      last_maintenance: plan.last_maintenance || '',
      next_maintenance: plan.next_maintenance || '',
      status: plan.status,
      notes: plan.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;
    try {
      const { error } = await supabase.from('maintenance_plans').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleCompleteMaintenance = async (plan: MaintenancePlan) => {
    const today = new Date();
    const nextDate = addDays(today, plan.frequency_days);

    try {
      const { error } = await supabase
        .from('maintenance_plans')
        .update({
          last_maintenance: format(today, 'yyyy-MM-dd'),
          next_maintenance: format(nextDate, 'yyyy-MM-dd'),
        })
        .eq('id', plan.id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating maintenance:', error);
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      client_id: '',
      name: '',
      frequency_days: 30,
      last_maintenance: '',
      next_maintenance: '',
      status: 'active',
      notes: '',
    });
  };

  const handleLastMaintenanceChange = (date: string) => {
    const nextDate = date ? format(addDays(new Date(date), formData.frequency_days), 'yyyy-MM-dd') : '';
    setFormData({ ...formData, last_maintenance: date, next_maintenance: nextDate });
  };

  const getMaintenanceStatus = (plan: MaintenancePlan) => {
    if (plan.status !== 'active') return { label: plan.status === 'paused' ? 'Pausado' : 'Cancelado', color: 'bg-slate-100 text-slate-700', urgent: false };
    if (!plan.next_maintenance) return { label: 'Pendente', color: 'bg-amber-100 text-amber-700', urgent: false };

    const daysUntil = differenceInDays(new Date(plan.next_maintenance), new Date());
    if (daysUntil < 0) return { label: 'Atrasado', color: 'bg-red-100 text-red-700', urgent: true };
    if (daysUntil <= 7) return { label: `Em ${daysUntil} dia${daysUntil !== 1 ? 's' : ''}`, color: 'bg-amber-100 text-amber-700', urgent: true };
    return { label: 'Em dia', color: 'bg-emerald-100 text-emerald-700', urgent: false };
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.client?.name.toLowerCase().includes(search.toLowerCase()) ||
      plan.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const urgentCount = plans.filter((p) => {
    if (p.status !== 'active' || !p.next_maintenance) return false;
    return differenceInDays(new Date(p.next_maintenance), new Date()) <= 7;
  }).length;

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
          <h1 className="text-2xl font-bold text-slate-900">Manutencao Preventiva</h1>
          <p className="text-slate-600 mt-1">Gerencie planos de manutencao</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Planos Ativos</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {plans.filter((p) => p.status === 'active').length}
              </p>
            </div>
            <div className="bg-emerald-500 p-3 rounded-xl">
              <Wrench className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Proximos 7 dias</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{urgentCount}</p>
            </div>
            <div className="bg-amber-500 p-3 rounded-xl">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total de Planos</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{plans.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou plano..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredPlans.length === 0 ? (
            <p className="p-8 text-center text-slate-500">Nenhum plano encontrado</p>
          ) : (
            filteredPlans.map((plan) => {
              const statusInfo = getMaintenanceStatus(plan);
              return (
                <div key={plan.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{plan.client?.name || 'Cliente'}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>Frequencia: a cada {plan.frequency_days} dias</span>
                        {plan.last_maintenance && (
                          <span>Ultima: {format(new Date(plan.last_maintenance), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        )}
                        {plan.next_maintenance && (
                          <span>Proxima: {format(new Date(plan.next_maintenance), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.status === 'active' && (
                        <button
                          onClick={() => handleCompleteMaintenance(plan)}
                          className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          Concluir
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingPlan ? 'Editar Plano' : 'Novo Plano de Manutencao'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
            <select
              required
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Plano *</label>
            <input
              type="text"
              required
              placeholder="Ex: Manutencao ar-condicionado"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frequencia (dias) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.frequency_days}
                onChange={(e) => setFormData({ ...formData, frequency_days: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ultima Manutencao</label>
              <input
                type="date"
                value={formData.last_maintenance}
                onChange={(e) => handleLastMaintenanceChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proxima Manutencao</label>
              <input
                type="date"
                value={formData.next_maintenance}
                onChange={(e) => setFormData({ ...formData, next_maintenance: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observacoes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {editingPlan ? 'Salvar' : 'Criar Plano'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
