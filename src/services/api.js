const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Permintaan API gagal.');
  }

  return data;
}

export const api = {
  async health() {
    return request('/health');
  },

  async login(payload) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async registerCustomer(payload) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAttributes() {
    const data = await request('/attributes');
    return data.attributes;
  },

  async saveAttribute(payload) {
    const body = {
      code: payload.code,
      label: payload.label,
      group: payload.group,
    };

    if (payload.originalCode) {
      const data = await request(`/attributes/${encodeURIComponent(payload.originalCode)}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return data.attribute;
    }

    const data = await request('/attributes', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return data.attribute;
  },

  async deleteAttribute(code) {
    return request(`/attributes/${encodeURIComponent(code)}`, { method: 'DELETE' });
  },

  async getTreatments() {
    const data = await request('/treatments');
    return data.treatments;
  },

  async saveTreatment(payload) {
    const body = {
      name: payload.name,
      category: payload.category,
      summary: payload.summary || payload.articleDescription,
      description: payload.description,
      price: Number(payload.price),
      duration: Number(payload.duration),
      image: payload.image || '',
      rating: payload.rating || 4.8,
      status: payload.status,
      attributes: payload.attributes || [],
    };

    if (payload.id) {
      const data = await request(`/treatments/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return data.treatment;
    }

    const data = await request('/treatments', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return data.treatment;
  },

  async deleteTreatment(id) {
    return request(`/treatments/${id}`, { method: 'DELETE' });
  },

  async getConsultations(userId) {
    const suffix = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const data = await request(`/consultations${suffix}`);
    return data.consultations;
  },

  async getConsultation(id) {
    const data = await request(`/consultations/${id}`);
    return data.consultation;
  },

  async createConsultation(payload) {
    const data = await request('/consultations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.consultation;
  },

  async updateConsultationStatus(id, status) {
    const data = await request(`/consultations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return data.consultation;
  },

  async chooseTreatment(id, treatmentId) {
    const data = await request(`/consultations/${id}/selected-treatment`, {
      method: 'PUT',
      body: JSON.stringify({ treatmentId }),
    });
    return data.consultation;
  },

  async deleteConsultation(id) {
    return request(`/consultations/${id}`, { method: 'DELETE' });
  },
};
