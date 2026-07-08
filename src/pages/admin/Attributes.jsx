import { useMemo, useState } from 'react';
import { Edit2, Plus, Save, Search, Tags, Trash2, X } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

const groupOptions = [
  'Area',
  'Kulit wajah',
  'Rambut',
  'Kondisi lain',
  'Manfaat',
  'Kuku/kulit',
];

function emptyForm() {
  return {
    originalCode: '',
    originalLabel: '',
    code: '',
    label: '',
    group: 'Area',
  };
}

export default function Attributes({
  attributes = [],
  treatments = [],
  onSaveAttribute,
  onDeleteAttribute,
  onLogout,
}) {
  const [query, setQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const usageByLabel = useMemo(() => {
    return treatments.reduce((result, treatment) => {
      treatment.attributes.forEach((attribute) => {
        result[attribute] = (result[attribute] || 0) + 1;
      });
      return result;
    }, {});
  }, [treatments]);

  const filteredAttributes = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return attributes;

    return attributes.filter((attribute) =>
      [attribute.code, attribute.label, attribute.group]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [attributes, query]);

  const groupedAttributes = useMemo(() => {
    return groupOptions.map((group) => ({
      group,
      count: attributes.filter((attribute) => attribute.group === group).length,
    }));
  }, [attributes]);

  const openCreateForm = () => {
    setError('');
    setForm(emptyForm());
    setIsFormOpen(true);
  };

  const openEditForm = (attribute) => {
    setError('');
    setForm({
      originalCode: attribute.code,
      originalLabel: attribute.label,
      code: attribute.code,
      label: attribute.label,
      group: attribute.group,
    });
    setIsFormOpen(true);
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    const label = form.label.trim();
    const duplicateCode = attributes.some(
      (attribute) => attribute.code === code && attribute.code !== form.originalCode
    );
    const duplicateLabel = attributes.some(
      (attribute) => attribute.label.toLowerCase() === label.toLowerCase() &&
        attribute.label !== form.originalLabel
    );

    if (duplicateCode) {
      setError('Kode atribut sudah digunakan.');
      return;
    }

    if (duplicateLabel) {
      setError('Nama atribut sudah digunakan.');
      return;
    }

    try {
      await onSaveAttribute({ ...form, code, label });
      setIsFormOpen(false);
      setForm(emptyForm());
    } catch (saveError) {
      setError(saveError.message || 'Atribut gagal disimpan.');
    }
  };

  const handleDelete = async (attribute) => {
    const approved = window.confirm(
      `Hapus atribut ${attribute.code} - ${attribute.label}? Atribut ini juga akan dilepas dari treatment.`
    );
    if (approved) await onDeleteAttribute(attribute.code);
  };

  return (
    <div className="admin-shell">
      <AdminSidebar onLogout={onLogout} />
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Data atribut rekomendasi</p>
            <h1>Kelola Atribut</h1>
            <p>
              Atur kode, nama, dan kelompok atribut yang menjadi dasar pencocokan
              profil pelanggan dengan treatment.
            </p>
          </div>
          <div className="admin-toolbar">
            <div className="search-field">
              <Search size={17} />
              <input
                type="text"
                placeholder="Cari atribut..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button type="button" className="btn-primary" onClick={openCreateForm}>
              <Plus size={17} />
              Atribut
            </button>
          </div>
        </header>

        <div className="attribute-summary-grid">
          {groupedAttributes.map((item) => (
            <article key={item.group} className="metric-card compact">
              <div>
                <span className="metric-icon"><Tags size={17} /></span>
                <span className="metric-helper">Kelompok</span>
              </div>
              <p>{item.group}</p>
              <strong>{item.count}</strong>
            </article>
          ))}
        </div>

        <section className="admin-card table-card">
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama Atribut</th>
                  <th>Kelompok</th>
                  <th>Dipakai Treatment</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttributes.map((attribute) => (
                  <tr key={attribute.code}>
                    <td><strong>{attribute.code}</strong></td>
                    <td>{attribute.label}</td>
                    <td><span className="soft-pill">{attribute.group}</span></td>
                    <td>{usageByLabel[attribute.label] || 0} treatment</td>
                    <td>
                      <div className="action-row">
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Edit ${attribute.label}`}
                          onClick={() => openEditForm(attribute)}
                        >
                          <Edit2 size={17} />
                        </button>
                        <button
                          type="button"
                          className="icon-button danger"
                          aria-label={`Hapus ${attribute.label}`}
                          onClick={() => handleDelete(attribute)}
                        >
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
            <span>Menampilkan {filteredAttributes.length} dari {attributes.length} atribut</span>
            <span>Perubahan atribut memengaruhi pilihan pada form treatment.</span>
          </div>
        </section>
      </main>

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-card treatment-form" onSubmit={handleSubmit}>
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{form.originalCode ? 'Edit atribut' : 'Atribut baru'}</p>
                <h2>{form.originalCode ? form.originalLabel : 'Tambah Atribut'}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Tutup form"
                onClick={() => setIsFormOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid two">
              <label className="field">
                <span>Kode atribut</span>
                <input
                  value={form.code}
                  onChange={(event) => updateForm('code', event.target.value)}
                  placeholder="Contoh: A22"
                  required
                />
              </label>
              <label className="field">
                <span>Kelompok</span>
                <select value={form.group} onChange={(event) => updateForm('group', event.target.value)}>
                  {groupOptions.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field">
              <span>Nama atribut</span>
              <input
                value={form.label}
                onChange={(event) => updateForm('label', event.target.value)}
                placeholder="Contoh: Kulit kering"
                required
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn-primary wide-button">
              <Save size={18} />
              Simpan Atribut
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
