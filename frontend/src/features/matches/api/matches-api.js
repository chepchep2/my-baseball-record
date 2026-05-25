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

export async function getMatches(apiClient) {
  const response = await apiClient.get("/api/matches");
  return (response.items ?? []).map((item) => ({
    id: item.gameId,
    href: `/matches/${item.gameId}/records/${item.myBatterRecordId}`,
    verified: Boolean(item.verified),
    playedDate: item.playedDate,
    playedLabel: item.playedAtLabel,
    summaryLabel: item.summaryLabel,
  }));
}

export async function createMatchRecord(apiClient, gameId, payload) {
  return apiClient.post(`/api/matches/${gameId}/records`, payload);
}

export async function getMatchRecordDetail(apiClient, gameId, batterRecordId) {
  return apiClient.get(`/api/matches/${gameId}/records/${batterRecordId}`);
}

export async function updateMatchRecord(apiClient, gameId, batterRecordId, payload) {
  return apiClient.put(`/api/matches/${gameId}/records/${batterRecordId}`, payload);
}

export async function deleteMatchRecord(apiClient, gameId, batterRecordId) {
  return apiClient.delete(`/api/matches/${gameId}/records/${batterRecordId}`);
}

export async function verifyMatchRecord(apiClient, gameId, batterRecordId) {
  return apiClient.post(`/api/matches/${gameId}/records/${batterRecordId}/verification`, {});
}
