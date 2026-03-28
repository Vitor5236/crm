import { useEffect, useState } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, Percent, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DiscountPolicy } from '../types/database';

export default function Discounts() {
  const [discounts, setDiscounts] = useState<DiscountPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountPolicy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage',
    value: 0,
    min_purchase: 0,
    start_date: '',
    end_date: '',
    active: true,
  });

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts(data || []);
    } catch (error) {
      console.error('Error loading discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (editingDiscount) {
        const { error } = await supabase
          .from('discount_policies')
          .update(payload)
          .eq('id', editingDiscount.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('discount_policies').insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      resetForm();
      loadDiscounts();
    } catch (error) {
      console.error('Error saving discount:', error);
    }
  };

  const handleEdit = (discount: DiscountPolicy) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      type: discount.type,
      value: discount.value,
      min_purchase: discount.min_purchase,
      start_date: discount.start_date || '',
      end_date: discount.end_date || '',
      active: discount.active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta politica de desconto?')) return;
    try {
      const { error } = await supabase.from('discount_policies').delete().eq('id', id);
      if (error) throw error;
      loadDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
    }
  };

  const resetForm = () => {
    setEditingDiscount(null);
    setFormData({
      name: '',
      type: 'percentage',
      value: 0,
      min_purchase: 0,
      start_date: '',
      end_date: '',
      active: true,
    });
  };

  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch = discount.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || discount.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isDiscountValid = (discount: DiscountPolicy) => {
    if (!discount.active) return false;
    const now = new Date();
    if (discount.start_date && new Date(discount.start_date) > now) return false;
    if (discount.end_date && new Date(discount.end_date) < now) return false;
    return true;
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
          <h1 className="text-2xl font-bold text-slate-900">Politica de Descontos</h1>
          <p className="text-slate-600 mt-1">Gerencie regras de desconto</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Nova Politica
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total de Politicas</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{discounts.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <Percent className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Ativas Agora</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {discounts.filter(isDiscountValid).length}
              </p>
            </div>
            <div className="bg-emerald-500 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Com Periodo</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {discounts.filter((d) => d.start_date || d.end_date).length}
              </p>
            </div>
            <div className="bg-amber-500 p-3 rounded-xl">
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
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="percentage">Porcentagem</option>
            <option value="fixed">Valor Fixo</option>
          </select>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredDiscounts.length === 0 ? (
            <p className="p-8 text-center text-slate-500">Nenhuma politica encontrada</p>
          ) : (
            filteredDiscounts.map((discount) => {
              const valid = isDiscountValid(discount);
              return (
                <div key={discount.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-900">{discount.name}</h3>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          valid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {valid ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1 font-medium text-emerald-600">
                          {discount.type === 'percentage' ? (
                            <>
                              <Percent className="w-4 h-4" />
                              {discount.value}% de desconto
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(discount.value)} de desconto
                            </>
                          )}
                        </span>
                        {discount.min_purchase > 0 && (
                          <span className="text-slate-500">
                            Compra minima: {formatCurrency(discount.min_purchase)}
                          </span>
                        )}
                      </div>
                      {(discount.start_date || discount.end_date) && (
                        <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {discount.start_date && `De ${format(new Date(discount.start_date), 'dd/MM/yyyy', { locale: ptBR })}`}
                          {discount.start_date && discount.end_date && ' '}
                          {discount.end_date && `ate ${format(new Date(discount.end_date), 'dd/MM/yyyy', { locale: ptBR })}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(discount)}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
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
        title={editingDiscount ? 'Editar Politica' : 'Nova Politica de Desconto'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
            <input
              type="text"
              required
              placeholder="Ex: Desconto de Natal, Cliente VIP..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor {formData.type === 'percentage' ? '(%)' : '(R$)'} *
              </label>
              <input
                type="number"
                required
                min="0"
                step={formData.type === 'percentage' ? '1' : '0.01'}
                max={formData.type === 'percentage' ? '100' : undefined}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Compra Minima (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.min_purchase}
              onChange={(e) => setFormData({ ...formData, min_purchase: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Inicio</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="active" className="text-sm text-slate-700">Politica ativa</label>
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
              {editingDiscount ? 'Salvar' : 'Criar Politica'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
