export const attributeCatalog = [
  { code: "A1", label: "Wajah", group: "Area" },
  { code: "A2", label: "Rambut", group: "Area" },
  { code: "A3", label: "Kuku tangan", group: "Area" },
  { code: "A4", label: "Kuku kaki", group: "Area" },
  { code: "A5", label: "Kulit berminyak", group: "Kulit wajah" },
  { code: "A6", label: "Kulit kusam", group: "Kulit wajah" },
  { code: "A7", label: "Komedo", group: "Kulit wajah" },
  { code: "A8", label: "Kulit sensitif", group: "Kulit wajah" },
  { code: "A9", label: "Rambut kering", group: "Rambut" },
  { code: "A10", label: "Rambut rusak", group: "Rambut" },
  { code: "A11", label: "Rambut bercabang", group: "Rambut" },
  { code: "A12", label: "Wajah lelah", group: "Kondisi lain" },
  { code: "A13", label: "Relaksasi", group: "Kondisi lain" },
  { code: "A14", label: "Nutrisi rambut", group: "Manfaat" },
  { code: "A15", label: "Membersihkan wajah", group: "Manfaat" },
  { code: "A16", label: "Penguatan rambut", group: "Manfaat" },
  { code: "A17", label: "Melembutkan rambut", group: "Manfaat" },
  { code: "A18", label: "Kebersihan kuku", group: "Kuku/kulit" },
  { code: "A19", label: "Kesehatan kaki", group: "Kuku/kulit" },
  { code: "A20", label: "Nutrisi kulit", group: "Kuku/kulit" },
  { code: "A21", label: "Relaksasi wajah", group: "Kuku/kulit" },
  { code: "A22", label: "Kuku kusam", group: "Kuku/kulit" },
  { code: "A23", label: "Kaki kering", group: "Kuku/kulit" },
  { code: "A24", label: "Kulit normal", group: "Kulit wajah" },
];

const attributeCodeByLabel = Object.fromEntries(
  attributeCatalog.map((attribute) => [attribute.label, attribute.code])
);

export const articleProfileExample = {
  area: "Wajah",
  skinType: "Kulit berminyak",
  problems: ["Kulit kusam", "Komedo"],
  goal: "Membersihkan wajah",
  history: "Belum pernah facial",
};

export const profileOptions = {
  areas: ["Wajah", "Rambut", "Kuku tangan", "Kuku kaki"],
  skinTypes: ["Kulit normal", "Kulit berminyak", "Kulit sensitif", "Kulit kusam"],
  problems: [
    "Komedo",
    "Kulit kusam",
    "Kulit berminyak",
    "Wajah lelah",
    "Rambut kering",
    "Rambut rusak",
    "Rambut bercabang",
    "Kuku kusam",
    "Kaki kering",
  ],
  goals: [
    "Membersihkan wajah",
    "Nutrisi kulit",
    "Relaksasi wajah",
    "Nutrisi rambut",
    "Penguatan rambut",
    "Melembutkan rambut",
    "Kebersihan kuku",
    "Kesehatan kaki",
  ],
  histories: ["Belum pernah facial", "Pernah facial", "Pernah hair spa", "Pernah manicure"],
};

export const treatments = [
  {
    id: 1,
    name: "Facial",
    category: "Wajah",
    articleDescription: "Bersihkan wajah",
    summary: "Membersihkan wajah",
    price: 150000,
    duration: 60,
    rating: 4.9,
    status: "Tersedia",
    image: "https://images.unsplash.com/photo-1615396899839-c99c121888b0?auto=format&fit=crop&q=80&w=800",
    description: "Membersihkan wajah secara menyeluruh untuk membantu mengurangi komedo, minyak berlebih, dan tampilan kulit kusam.",
    attributes: ["Wajah", "Komedo", "Kulit kusam", "Kulit berminyak", "Membersihkan wajah"],
  },
  {
    id: 2,
    name: "Hair Spa",
    category: "Rambut",
    articleDescription: "Nutrisi rambut",
    summary: "Nutrisi rambut",
    price: 180000,
    duration: 90,
    rating: 4.8,
    status: "Tersedia",
    image: "https://images.unsplash.com/photo-1517596001150-13ad21e646eb?auto=format&fit=crop&q=80&w=800",
    description: "Perawatan nutrisi rambut dan kulit kepala untuk rambut kering, disertai pijatan ringan agar pelanggan merasa lebih rileks.",
    attributes: ["Rambut", "Rambut kering", "Nutrisi rambut", "Relaksasi"],
  },
  {
    id: 3,
    name: "Creambath",
    category: "Rambut",
    articleDescription: "Penguatan rambut",
    summary: "Penguatan rambut",
    price: 120000,
    duration: 60,
    rating: 4.7,
    status: "Tersedia",
    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800",
    description: "Perawatan klasik untuk membantu menguatkan akar rambut dan merawat rambut yang mulai rusak.",
    attributes: ["Rambut", "Rambut rusak", "Penguatan rambut"],
  },
  {
    id: 4,
    name: "Hair Mask",
    category: "Rambut",
    articleDescription: "Melembutkan rambut",
    summary: "Melembutkan rambut",
    price: 160000,
    duration: 60,
    rating: 4.8,
    status: "Tersedia",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
    description: "Masker intensif untuk membuat rambut terasa lebih lembut dan membantu merawat rambut bercabang.",
    attributes: ["Rambut", "Rambut bercabang", "Melembutkan rambut"],
  },
  {
    id: 5,
    name: "Manicure",
    category: "Kuku tangan",
    articleDescription: "Merawat kuku tangan",
    summary: "Merawat kuku tangan",
    price: 90000,
    duration: 45,
    rating: 4.6,
    status: "Tersedia",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
    description: "Perawatan kuku tangan untuk menjaga kebersihan, kerapian, dan tampilan kuku yang lebih terawat.",
    attributes: ["Kuku tangan", "Kuku kusam", "Kebersihan kuku"],
  },
  {
    id: 6,
    name: "Pedicure",
    category: "Kuku kaki",
    articleDescription: "Merawat kuku kaki",
    summary: "Merawat kuku kaki",
    price: 100000,
    duration: 45,
    rating: 4.6,
    status: "Tersedia",
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=800",
    description: "Perawatan kuku kaki dan telapak kaki untuk membantu menjaga kebersihan sekaligus kenyamanan kaki.",
    attributes: ["Kuku kaki", "Kaki kering", "Kesehatan kaki"],
  },
  {
    id: 7,
    name: "Masker Wajah",
    category: "Wajah",
    articleDescription: "Nutrisi kulit wajah",
    summary: "Nutrisi kulit wajah",
    price: 110000,
    duration: 45,
    rating: 4.7,
    status: "Tersedia",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
    description: "Masker bernutrisi untuk membantu menenangkan kulit sensitif dan menjaga keseimbangan kulit berminyak.",
    attributes: ["Wajah", "Kulit berminyak", "Kulit sensitif", "Nutrisi kulit"],
  },
  {
    id: 8,
    name: "Totok Wajah",
    category: "Wajah",
    articleDescription: "Relaksasi wajah",
    summary: "Relaksasi wajah",
    price: 130000,
    duration: 45,
    rating: 4.8,
    status: "Tersedia",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
    description: "Pijatan titik wajah untuk pelanggan yang merasa wajah lelah dan membutuhkan relaksasi ringan.",
    attributes: ["Wajah", "Wajah lelah", "Relaksasi", "Relaksasi wajah"],
  },
];

export function getAttributeCode(attribute) {
  return attributeCodeByLabel[attribute] || "-";
}

export function getAttributeCodes(attributes) {
  return attributes.map((attribute) => getAttributeCode(attribute));
}

export function getAttributeDisplay(attributes) {
  return attributes
    .map((attribute) => {
      const code = getAttributeCode(attribute);
      return code === "-" ? attribute : `${code} ${attribute}`;
    })
    .join("; ");
}

export function buildUserAttributes(preferences = articleProfileExample) {
  const userAttributes = [];

  if (preferences.area) userAttributes.push(preferences.area);
  if (preferences.skinType) userAttributes.push(preferences.skinType);

  if (Array.isArray(preferences.problems)) {
    userAttributes.push(...preferences.problems);
  }

  if (preferences.goal) userAttributes.push(preferences.goal);

  return Array.from(new Set(userAttributes.filter(Boolean)));
}

export function cosineSimilarity(userAttributes, treatmentAttributes) {
  if (!userAttributes.length || !treatmentAttributes.length) return 0;

  const dotProduct = userAttributes.filter((attribute) =>
    treatmentAttributes.includes(attribute)
  ).length;
  const userMagnitude = userAttributes.length;
  const treatmentMagnitude = treatmentAttributes.length;

  if (userMagnitude === 0 || treatmentMagnitude === 0) return 0;

  return dotProduct / (Math.sqrt(userMagnitude) * Math.sqrt(treatmentMagnitude));
}

function getSuitabilityLabel(similarity) {
  if (similarity >= 0.95) return "Sangat sesuai";
  if (similarity >= 0.4) return "Cukup sesuai";
  if (similarity > 0) return "Kurang sesuai";
  return "Tidak sesuai";
}

function createReason(treatment, matchedAttributes, similarity) {
  if (!matchedAttributes.length) {
    return `${treatment.name} belum menjadi prioritas utama untuk kebutuhan konsultasi saat ini.`;
  }

  const matchedText = matchedAttributes.join(", ");

  if (similarity >= 0.95) {
    return `${treatment.name} sangat disarankan karena sesuai dengan kebutuhan pelanggan: ${matchedText}.`;
  }

  if (similarity >= 0.4) {
    return `${treatment.name} cocok sebagai pilihan perawatan karena menjawab kebutuhan: ${matchedText}.`;
  }

  return `${treatment.name} dapat dipertimbangkan sebagai alternatif ringan untuk kebutuhan: ${matchedText}.`;
}

export function getRecommendations(preferences = {}, treatmentList = treatments) {
  const userAttributes = buildUserAttributes(preferences);
  const userCodes = getAttributeCodes(userAttributes);
  const activeTreatments = treatmentList.filter(
    (treatment) => treatment.status !== "Tidak tersedia"
  );

  return activeTreatments
    .map((treatment) => {
      const matchedAttributes = userAttributes.filter((attribute) =>
        treatment.attributes.includes(attribute)
      );
      const matchedCodes = getAttributeCodes(matchedAttributes);
      const dotProduct = matchedAttributes.length;
      const userMagnitude = userAttributes.length;
      const treatmentMagnitude = treatment.attributes.length;
      const similarityScore = cosineSimilarity(userAttributes, treatment.attributes);

      return {
        ...treatment,
        userAttributes,
        userCodes,
        attributeCodes: getAttributeCodes(treatment.attributes),
        matchedAttributes,
        matchedCodes,
        similarityScore,
        similarityDisplay: similarityScore.toFixed(2),
        matchPercentage: Math.round(similarityScore * 100),
        suitabilityLabel: getSuitabilityLabel(similarityScore),
        reason: createReason(treatment, matchedAttributes, similarityScore),
        calculation: {
          dotProduct,
          userMagnitude,
          treatmentMagnitude,
          denominator:
            Math.sqrt(userMagnitude) * Math.sqrt(treatmentMagnitude),
          formula: `${dotProduct} / (sqrt(${userMagnitude}) x sqrt(${treatmentMagnitude}))`,
        },
      };
    })
    .sort(
      (a, b) =>
        b.similarityScore - a.similarityScore ||
        String(a.id).localeCompare(String(b.id), "id-ID", { numeric: true })
    );
}

export const articleRankingExample = getRecommendations(articleProfileExample);
