export async function getMatchCandidates(
  apiClient,
  { playedDate, playedHour, playedMinute, cityName, districtName, expandScope = false },
) {
  const params = new URLSearchParams({
    playedDate,
    playedHour: String(playedHour),
    playedMinute: String(playedMinute),
    cityName,
    districtName,
    expandScope: String(expandScope),
  });

  return apiClient.get(`/api/matches/candidates?${params.toString()}`);
}

export async function getMatchStadiumSuggestions(apiClient, { cityName, districtName }) {
  const params = new URLSearchParams({
    cityName,
    districtName,
  });

  return apiClient.get(`/api/matches/stadiums?${params.toString()}`);
}

export async function createMatch(apiClient, payload) {
  return apiClient.post("/api/matches", payload);
}

export async function getMatchDetail(apiClient, gameId) {
  return apiClient.get(`/api/matches/${gameId}`);
}

export async function createMatchRecord(apiClient, gameId, payload) {
  return apiClient.post(`/api/matches/${gameId}/records`, payload);
}

export async function verifyMatchRecord(apiClient, gameId, batterRecordId) {
  return apiClient.post(`/api/matches/${gameId}/records/${batterRecordId}/verification`, {});
}
