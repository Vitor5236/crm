import { useEffect, useState } from 'react';
import { Plus, Search, CreditCard as Edit2, Gift, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { tierForPoints } from '../lib/loyalty';
import Modal from '../components/Modal';
import type { LoyaltyProgram, Client } from '../types/database';

export default function Loyalty() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    points: 0,
    tier: 'bronze',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data: programsData }, { data: clientsData }] = await Promise.all([
        supabase
          .from('loyalty_programs')
          .select('*, client:clients(*)')
          .order('points', { ascending: false }),
        supabase.from('clients').select('*').eq('status', 'active'),
      ]);

      setPrograms(programsData || []);
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
      if (editingProgram) {
        const { error } = await supabase
          .from('loyalty_programs')
          .update(formData)
          .eq('id', editingProgram.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('loyalty_programs').insert([formData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving program:', error);
    }
  };

  const handleEdit = (program: LoyaltyProgram) => {
    setEditingProgram(program);
    setFormData({
      client_id: program.client_id,
      points: program.points,
      tier: program.tier,
    });
    setIsModalOpen(true);
  };

  const handleAddPoints = async (program: LoyaltyProgram, amount: number) => {
    const newPoints = program.points + amount;
    const newTier = tierForPoints(newPoints);

    try {
      const { error } = await supabase
        .from('loyalty_programs')
        .update({ points: newPoints, tier: newTier })
        .eq('id', program.id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const resetForm = () => {
    setEditingProgram(null);
    setFormData({
      client_id: '',
      points: 0,
      tier: 'bronze',
    });
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return { label: 'Platina', color: 'bg-slate-200 text-slate-800', icon: '🏆' };
      case 'gold':
        return { label: 'Ouro', color: 'bg-yellow-100 text-yellow-800', icon: '🥇' };
      case 'silver':
        return { label: 'Prata', color: 'bg-slate-100 text-slate-600', icon: '🥈' };
      default:
        return { label: 'Bronze', color: 'bg-amber-100 text-amber-800', icon: '🥉' };
    }
  };

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.client?.name.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'all' || program.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const enrolledClientsIds = programs.map((p) => p.client_id);
  const availableClients = clients.filter((c) => !enrolledClientsIds.includes(c.id) || editingProgram?.client_id === c.id);

  const tierCounts = {
    bronze: programs.filter((p) => p.tier === 'bronze').length,
    silver: programs.filter((p) => p.tier === 'silver').length,
    gold: programs.filter((p) => p.tier === 'gold').length,
    platinum: programs.filter((p) => p.tier === 'platinum').length,
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
          <h1 className="text-2xl font-bold text-slate-900">Programa de Fidelidade</h1>
          <p className="text-slate-600 mt-1">Gerencie pontos e beneficios</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Cadastrar Cliente
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(tierCounts).map(([tier, count]) => {
          const info = getTierInfo(tier);
          return (
            <div key={tier} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{info.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{count}</p>
                </div>
                <span className="text-2xl">{info.icon}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Todos os Niveis</option>
            <option value="platinum">Platina</option>
            <option value="gold">Ouro</option>
            <option value="silver">Prata</option>
            <option value="bronze">Bronze</option>
          </select>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredPrograms.length === 0 ? (
            <p className="p-8 text-center text-slate-500">Nenhum cliente no programa</p>
          ) : (
            filteredPrograms.map((program) => {
              const tierInfo = getTierInfo(program.tier);
              return (
                <div key={program.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
                        {tierInfo.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{program.client?.name || 'Cliente'}</h3>
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${tierInfo.color}`}>
                            {tierInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-600">{program.points} pontos</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddPoints(program, 10)}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <TrendingUp className="w-3 h-3" />
                        +10 pts
                      </button>
                      <button
                        onClick={() => handleAddPoints(program, 50)}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <TrendingUp className="w-3 h-3" />
                        +50 pts
                      </button>
                      <button
                        onClick={() => handleEdit(program)}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">Niveis e Beneficios</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="font-semibold text-amber-800">Bronze</p>
            <p className="text-xs text-amber-600 mt-1">0 - 199 pontos</p>
            <ul className="text-xs text-amber-700 mt-2 space-y-1">
              <li>5% desconto em servicos</li>
              <li>Acesso a promocoes</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-700">Prata</p>
            <p className="text-xs text-slate-500 mt-1">200 - 499 pontos</p>
            <ul className="text-xs text-slate-600 mt-2 space-y-1">
              <li>10% desconto em servicos</li>
              <li>Prioridade no agendamento</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="font-semibold text-yellow-800">Ouro</p>
            <p className="text-xs text-yellow-600 mt-1">500 - 999 pontos</p>
            <ul className="text-xs text-yellow-700 mt-2 space-y-1">
              <li>15% desconto em servicos</li>
              <li>Atendimento prioritario</li>
              <li>1 servico gratis/ano</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-100 rounded-lg border border-slate-300">
            <p className="font-semibold text-slate-800">Platina</p>
            <p className="text-xs text-slate-600 mt-1">1000+ pontos</p>
            <ul className="text-xs text-slate-700 mt-2 space-y-1">
              <li>20% desconto em servicos</li>
              <li>Atendimento VIP</li>
              <li>2 servicos gratis/ano</li>
              <li>Garantia estendida</li>
            </ul>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingProgram ? 'Editar Cadastro' : 'Cadastrar no Programa'}
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
              disabled={!!editingProgram}
            >
              <option value="">Selecione um cliente</option>
              {availableClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pontos</label>
              <input
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nivel</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Prata</option>
                <option value="gold">Ouro</option>
                <option value="platinum">Platina</option>
              </select>
            </div>
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
              {editingProgram ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
