export function buildUserAttributes(preferences = {}) {
  const userAttributes = [];

  if (preferences.area) userAttributes.push(preferences.area);
  if (preferences.skinType) userAttributes.push(preferences.skinType);
  if (Array.isArray(preferences.problems)) userAttributes.push(...preferences.problems);
  if (preferences.goal) userAttributes.push(preferences.goal);

  return Array.from(new Set(userAttributes.filter(Boolean)));
}

export function cosineSimilarity(userAttributes, treatmentAttributes) {
  if (!userAttributes.length || !treatmentAttributes.length) return 0;

  const dotProduct = userAttributes.filter((attribute) =>
    treatmentAttributes.includes(attribute)
  ).length;

  return dotProduct / (Math.sqrt(userAttributes.length) * Math.sqrt(treatmentAttributes.length));
}

function getSuitabilityLabel(similarity) {
  if (similarity >= 0.95) return 'Sangat sesuai';
  if (similarity >= 0.4) return 'Cukup sesuai';
  if (similarity > 0) return 'Kurang sesuai';
  return 'Tidak sesuai';
}

function createReason(treatment, matchedAttributes, similarity) {
  if (!matchedAttributes.length) {
    return `${treatment.name} belum menjadi prioritas utama untuk kebutuhan konsultasi saat ini.`;
  }

  const matchedText = matchedAttributes.join(', ');

  if (similarity >= 0.95) {
    return `${treatment.name} sangat disarankan karena sesuai dengan kebutuhan pelanggan: ${matchedText}.`;
  }

  if (similarity >= 0.4) {
    return `${treatment.name} cocok sebagai pilihan perawatan karena menjawab kebutuhan: ${matchedText}.`;
  }

  return `${treatment.name} dapat dipertimbangkan sebagai alternatif ringan untuk kebutuhan: ${matchedText}.`;
}

export function getRecommendations(preferences = {}, treatments = []) {
  const userAttributes = buildUserAttributes(preferences);
  const activeTreatments = treatments.filter((treatment) => treatment.status !== 'Tidak tersedia');

  return activeTreatments
    .map((treatment) => {
      const matchedAttributes = userAttributes.filter((attribute) =>
        treatment.attributes.includes(attribute)
      );
      const similarityScore = cosineSimilarity(userAttributes, treatment.attributes);

      return {
        ...treatment,
        matchedAttributes,
        similarityScore,
        similarityDisplay: similarityScore.toFixed(2),
        matchPercentage: Math.round(similarityScore * 100),
        suitabilityLabel: getSuitabilityLabel(similarityScore),
        reason: createReason(treatment, matchedAttributes, similarityScore),
      };
    })
    .sort(
      (a, b) =>
        b.similarityScore - a.similarityScore ||
        String(a.id).localeCompare(String(b.id), 'id-ID', { numeric: true })
    );
}
