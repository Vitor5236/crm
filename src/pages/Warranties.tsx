import { useEffect, useState } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { warrantyState } from '../lib/warranty';
import type { Warranty, Client, Service } from '../types/database';

export default function Warranties() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<Warranty | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    start_date: '',
    end_date: '',
    status: 'active',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data: warrantiesData }, { data: clientsData }, { data: servicesData }] = await Promise.all([
        supabase
          .from('warranties')
          .select('*, client:clients(*), service:services(*)')
          .order('end_date', { ascending: true }),
        supabase.from('clients').select('*').eq('status', 'active'),
        supabase.from('services').select('*').eq('active', true),
      ]);

      setWarranties(warrantiesData || []);
      setClients(clientsData || []);
      setServices(servicesData || []);
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
        service_id: formData.service_id || null,
      };

      if (editingWarranty) {
        const { error } = await supabase
          .from('warranties')
          .update(payload)
          .eq('id', editingWarranty.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('warranties').insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving warranty:', error);
    }
  };

  const handleEdit = (warranty: Warranty) => {
    setEditingWarranty(warranty);
    setFormData({
      client_id: warranty.client_id,
      service_id: warranty.service_id || '',
      start_date: warranty.start_date,
      end_date: warranty.end_date,
      status: warranty.status,
      description: warranty.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta garantia?')) return;
    try {
      const { error } = await supabase.from('warranties').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting warranty:', error);
    }
  };

  const resetForm = () => {
    setEditingWarranty(null);
    setFormData({
      client_id: '',
      service_id: '',
      start_date: '',
      end_date: '',
      status: 'active',
      description: '',
    });
  };

  const getWarrantyStatus = (warranty: Warranty) => {
    const { state, daysRemaining } = warrantyState(warranty.status, warranty.end_date);
    switch (state) {
      case 'claimed':
        return { label: 'Acionada', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle };
      case 'expired':
        return { label: 'Expirada', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
      case 'expiring':
        return { label: `${daysRemaining} dias restantes`, color: 'bg-amber-100 text-amber-700', icon: AlertTriangle };
      default:
        return { label: 'Ativa', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle };
    }
  };

  const filteredWarranties = warranties.filter((warranty) => {
    const matchesSearch =
      warranty.client?.name.toLowerCase().includes(search.toLowerCase()) ||
      warranty.service?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || warranty.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = warranties.filter((w) => {
    const s = warrantyState(w.status, w.end_date).state;
    return s === 'active' || s === 'expiring';
  }).length;
  const expiringCount = warranties.filter(
    (w) => warrantyState(w.status, w.end_date).state === 'expiring',
  ).length;

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
          <h1 className="text-2xl font-bold text-slate-900">Garantias</h1>
          <p className="text-slate-600 mt-1">Gerencie garantias de servicos</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Nova Garantia
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Garantias Ativas</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{activeCount}</p>
            </div>
            <div className="bg-emerald-500 p-3 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Expirando em 30 dias</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{expiringCount}</p>
            </div>
            <div className="bg-amber-500 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total de Garantias</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{warranties.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
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
              placeholder="Buscar por cliente ou servico..."
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
            <option value="active">Ativa</option>
            <option value="expired">Expirada</option>
            <option value="claimed">Acionada</option>
          </select>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredWarranties.length === 0 ? (
            <p className="p-8 text-center text-slate-500">Nenhuma garantia encontrada</p>
          ) : (
            filteredWarranties.map((warranty) => {
              const statusInfo = getWarrantyStatus(warranty);
              return (
                <div key={warranty.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-900">{warranty.client?.name || 'Cliente'}</h3>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        <p>{warranty.service?.name || warranty.description || 'Servico nao especificado'}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Valido de {format(new Date(warranty.start_date), 'dd/MM/yyyy', { locale: ptBR })} ate {format(new Date(warranty.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(warranty)}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(warranty.id)}
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
        title={editingWarranty ? 'Editar Garantia' : 'Nova Garantia'}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Servico (opcional)</label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Nenhum servico especifico</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Inicio *</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Fim *</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="active">Ativa</option>
              <option value="expired">Expirada</option>
              <option value="claimed">Acionada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descricao</label>
            <textarea
              rows={3}
              placeholder="Detalhes da garantia..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {editingWarranty ? 'Salvar' : 'Criar Garantia'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
