import { useEffect, useState } from 'react';
import { Plus, Search, Star, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SatisfactionSurvey, Client, Visit } from '../types/database';

export default function Surveys() {
  const [surveys, setSurveys] = useState<SatisfactionSurvey[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    visit_id: '',
    rating: 5,
    feedback: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data: surveysData }, { data: clientsData }, { data: visitsData }] = await Promise.all([
        supabase
          .from('satisfaction_surveys')
          .select('*, client:clients(*)')
          .order('created_at', { ascending: false }),
        supabase.from('clients').select('*').eq('status', 'active'),
        supabase.from('visits').select('*').eq('status', 'completed'),
      ]);

      setSurveys(surveysData || []);
      setClients(clientsData || []);
      setVisits(visitsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('satisfaction_surveys').insert([{
        ...formData,
        visit_id: formData.visit_id || null,
      }]);
      if (error) throw error;
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving survey:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pesquisa?')) return;
    try {
      const { error } = await supabase.from('satisfaction_surveys').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      visit_id: '',
      rating: 5,
      feedback: '',
    });
  };

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch = survey.client?.name.toLowerCase().includes(search.toLowerCase());
    const matchesRating = ratingFilter === 'all' || survey.rating === parseInt(ratingFilter);
    return matchesSearch && matchesRating;
  });

  const avgRating = surveys.length
    ? (surveys.reduce((acc, s) => acc + s.rating, 0) / surveys.length).toFixed(1)
    : '0.0';

  const ratingCounts = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: surveys.filter((s) => s.rating === rating).length,
  }));

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
          <h1 className="text-2xl font-bold text-slate-900">Pesquisas de Satisfacao</h1>
          <p className="text-slate-600 mt-1">Avalie a satisfacao dos clientes</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Nova Pesquisa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Media Geral</p>
              <p className="text-4xl font-bold text-slate-900 mt-1">{avgRating}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-xl">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 col-span-1 md:col-span-2">
          <p className="text-sm text-slate-600 mb-4">Distribuicao de Avaliacoes</p>
          <div className="space-y-2">
            {ratingCounts.reverse().map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-12">{rating} estrela{rating > 1 ? 's' : ''}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      rating >= 4 ? 'bg-emerald-500' : rating === 3 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${surveys.length ? (count / surveys.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
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
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">Todas as Avaliacoes</option>
            <option value="5">5 Estrelas</option>
            <option value="4">4 Estrelas</option>
            <option value="3">3 Estrelas</option>
            <option value="2">2 Estrelas</option>
            <option value="1">1 Estrela</option>
          </select>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredSurveys.length === 0 ? (
            <p className="p-8 text-center text-slate-500">Nenhuma pesquisa encontrada</p>
          ) : (
            filteredSurveys.map((survey) => (
              <div key={survey.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-slate-900">{survey.client?.name || 'Cliente'}</h3>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= survey.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {survey.feedback && <p className="mt-2 text-sm text-slate-600">{survey.feedback}</p>}
                    <p className="mt-1 text-xs text-slate-400">
                      {format(new Date(survey.created_at), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(survey.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Nova Pesquisa de Satisfacao"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Visita (opcional)</label>
            <select
              value={formData.visit_id}
              onChange={(e) => setFormData({ ...formData, visit_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Nenhuma visita especifica</option>
              {visits.filter(v => v.client_id === formData.client_id).map((visit) => (
                <option key={visit.id} value={visit.id}>
                  {visit.type} - {format(new Date(visit.scheduled_date), 'dd/MM/yyyy')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Avaliacao *</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-2 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Feedback</label>
            <textarea
              rows={4}
              placeholder="Comentarios do cliente..."
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
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
              Salvar Pesquisa
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
