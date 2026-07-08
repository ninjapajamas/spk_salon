import { useMemo, useState } from 'react';
import { Edit2, Plus, Save, Search, Scissors, Trash2, X } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const fallbackImages = {
  Wajah: 'https://images.unsplash.com/photo-1615396899839-c99c121888b0?auto=format&fit=crop&q=80&w=800',
  Rambut: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800',
  'Kuku tangan': 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800',
  'Kuku kaki': 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=800',
};

const statusOptions = ['Tersedia', 'Tidak tersedia'];
const categoryOptions = ['Wajah', 'Rambut', 'Kuku tangan', 'Kuku kaki'];

function createEmptyForm() {
  return {
    id: null,
    name: '',
    category: 'Wajah',
    summary: '',
    price: '',
    duration: '',
    status: 'Tersedia',
    image: '',
    description: '',
    attributes: ['Wajah'],
  };
}

export default function Inventory({
  attributes = [],
  treatments = [],
  onSaveTreatment,
  onDeleteTreatment,
  onLogout,
}) {
  const [query, setQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(createEmptyForm);
  const [formError, setFormError] = useState('');
  const attributeChoices = useMemo(
    () => Array.from(new Set(attributes.map((attribute) => attribute.label))),
    [attributes]
  );

  const filteredTreatments = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return treatments;

    return treatments.filter((item) =>
      [item.name, item.category, item.summary, item.articleDescription, item.description, ...item.attributes]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [query, treatments]);

  const activeTreatments = treatments.filter((item) => item.status !== 'Tidak tersedia');
  const averagePrice = treatments.length
    ? Math.round(treatments.reduce((total, item) => total + Number(item.price || 0), 0) / treatments.length)
    : 0;

  const openCreateForm = () => {
    setFormError('');
    setForm(createEmptyForm());
    setIsFormOpen(true);
  };

  const openEditForm = (treatment) => {
    setFormError('');
    setForm({
      ...treatment,
      summary: treatment.summary || treatment.articleDescription || '',
      attributes: treatment.attributes || [],
    });
    setIsFormOpen(true);
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleAttribute = (attribute) => {
    setForm((current) => {
      const exists = current.attributes.includes(attribute);
      return {
        ...current,
        attributes: exists
          ? current.attributes.filter((item) => item !== attribute)
          : [...current.attributes, attribute],
      };
    });
  };

  const handleCategoryChange = (category) => {
    setForm((current) => ({
      ...current,
      category,
      attributes: Array.from(new Set([category, ...current.attributes])),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      image: form.image || fallbackImages[form.category],
      articleDescription: form.summary,
      attributes: Array.from(new Set([form.category, ...form.attributes])),
    };
    try {
      setFormError('');
      await onSaveTreatment(payload);
      setIsFormOpen(false);
      setForm(createEmptyForm());
    } catch (error) {
      setFormError(error.message || 'Treatment gagal disimpan.');
    }
  };

  const handleDelete = async (treatment) => {
    const approved = window.confirm(`Hapus treatment ${treatment.name}?`);
    if (approved) await onDeleteTreatment(treatment.id);
  };

  return (
    <div className="admin-shell">
      <AdminSidebar onLogout={onLogout} />
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Data layanan salon</p>
            <h1>Kelola Treatment</h1>
            <p>Tambah, ubah, aktifkan, atau nonaktifkan layanan yang dipakai pada konsultasi pelanggan.</p>
          </div>
          <div className="admin-toolbar">
            <div className="search-field">
              <Search size={17} />
              <input
                type="text"
                placeholder="Cari treatment..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button className="btn-primary" type="button" onClick={openCreateForm}>
              <Plus size={17} />
              Treatment
            </button>
          </div>
        </header>

        <div className="metric-grid three">
          {[
            { label: 'Total Layanan', value: treatments.length, helper: 'Semua data' },
            { label: 'Tersedia', value: activeTreatments.length, helper: 'Bisa direkomendasikan' },
            { label: 'Rata-rata Harga', value: currency.format(averagePrice), helper: 'Estimasi layanan' },
          ].map((stat) => (
            <article key={stat.label} className="metric-card">
              <div>
                <span className="metric-icon"><Scissors size={18} /></span>
                <span className="metric-helper">{stat.helper}</span>
              </div>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>

        <section className="admin-card table-card">
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama Treatment</th>
                  <th>Kategori</th>
                  <th>Manfaat</th>
                  <th>Kebutuhan Cocok</th>
                  <th>Harga</th>
                  <th>Durasi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTreatments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-treatment">
                        <img src={item.image} alt={item.name} />
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td><span className="soft-pill">{item.category}</span></td>
                    <td>{item.summary || item.articleDescription}</td>
                    <td>
                      <div className="tag-list">
                        {item.attributes.slice(0, 4).map((attribute) => (
                          <span key={`${item.id}-${attribute}`}>{attribute}</span>
                        ))}
                        {item.attributes.length > 4 && <span>+{item.attributes.length - 4}</span>}
                      </div>
                    </td>
                    <td><strong>{currency.format(item.price)}</strong></td>
                    <td>{item.duration} menit</td>
                    <td><span className="status-pill">{item.status}</span></td>
                    <td>
                      <div className="action-row">
                        <button type="button" className="icon-button" aria-label={`Edit ${item.name}`} onClick={() => openEditForm(item)}>
                          <Edit2 size={17} />
                        </button>
                        <button type="button" className="icon-button danger" aria-label={`Hapus ${item.name}`} onClick={() => handleDelete(item)}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>Menampilkan {filteredTreatments.length} dari {treatments.length} treatment</span>
            <span>Perubahan langsung memengaruhi rekomendasi pelanggan.</span>
          </div>
        </section>
      </main>

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-card treatment-form" onSubmit={handleSubmit}>
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{form.id ? 'Edit treatment' : 'Treatment baru'}</p>
                <h2>{form.id ? form.name : 'Tambah Treatment'}</h2>
              </div>
              <button type="button" className="icon-button" aria-label="Tutup form" onClick={() => setIsFormOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="form-grid two">
              <label className="field">
                <span>Nama treatment</span>
                <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} required />
              </label>
              <label className="field">
                <span>Kategori</span>
                <select value={form.category} onChange={(event) => handleCategoryChange(event.target.value)}>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Manfaat singkat</span>
                <input value={form.summary} onChange={(event) => updateForm('summary', event.target.value)} required />
              </label>
              <label className="field">
                <span>Status</span>
                <select value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Harga</span>
                <input type="number" min="0" value={form.price} onChange={(event) => updateForm('price', event.target.value)} required />
              </label>
              <label className="field">
                <span>Durasi menit</span>
                <input type="number" min="1" value={form.duration} onChange={(event) => updateForm('duration', event.target.value)} required />
              </label>
            </div>

            <label className="field">
              <span>URL gambar</span>
              <input value={form.image} onChange={(event) => updateForm('image', event.target.value)} placeholder="Opsional, otomatis memakai gambar kategori" />
            </label>

            <label className="field">
              <span>Deskripsi layanan</span>
              <textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows={4} required />
            </label>

            <div>
              <div className="form-section-title">Kebutuhan pelanggan yang cocok</div>
              <div className="attribute-picker">
                {attributeChoices.map((attribute) => (
                  <label key={attribute} className="checkbox-pill">
                    <input
                      type="checkbox"
                      checked={form.attributes.includes(attribute)}
                      onChange={() => toggleAttribute(attribute)}
                    />
                    {attribute}
                  </label>
                ))}
              </div>
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <button type="submit" className="btn-primary wide-button">
              <Save size={18} />
              Simpan Treatment
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
