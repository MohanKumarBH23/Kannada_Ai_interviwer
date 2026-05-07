const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function startInterview(
  jobRole: string, 
  difficulty: string, 
  resumeFile: File | null = null, 
  token?: string,
  jobId?: string,
  candidateId?: string,
  isPractice: boolean = false
) {
  const formData = new FormData();
  formData.append('job_role', jobRole);
  formData.append('difficulty', difficulty);
  formData.append('is_practice', String(isPractice));
  if (resumeFile) {
    formData.append('resume', resumeFile);
  }
  if (jobId) {
    formData.append('job_id', jobId);
  }
  if (candidateId) {
    formData.append('candidate_id', candidateId);
  }

  const response = await fetch(`${API_BASE_URL}/interview/start`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to start interview');
  return response.json();
}

export async function submitAnswer(sessionId: string, answer: string, token?: string) {
  const response = await fetch(`${API_BASE_URL}/interview/answer`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ session_id: sessionId, answer }),
  });
  if (!response.ok) throw new Error('Failed to submit answer');
  return response.json();
}

export async function submitAudioAnswer(sessionId: string, audioBlob: Blob, token?: string) {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('audio', audioBlob, 'audio.webm');

  const response = await fetch(`${API_BASE_URL}/interview/audio-answer`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to submit audio answer');
  return response.json();
}

export async function getInterviewSession(sessionId: string, token?: string) {
  const response = await fetch(`${API_BASE_URL}/interview/${sessionId}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Failed to get interview session');
  return response.json();
}

export async function stopInterview(sessionId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/interview/${sessionId}/stop`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to stop interview');
  return response.json();
}

export async function deleteInterview(sessionId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/interview/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete interview');
  return response.json();
}

export async function updateProfile(data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
}

export async function analyzeResumeATS(file: File, token: string) {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await fetch(`${API_BASE_URL}/profile/resume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: 'Failed to analyze resume' }));
    throw new Error(JSON.stringify(errorBody));
  }

  return response.json();
}

export async function getInterviewReport(sessionId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/interview/${sessionId}/report`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to generate report' }));
    throw new Error(err.detail || 'Failed to generate report');
  }
  return response.json();
}

export async function getJobs(token: string) {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch jobs');
  return response.json();
}

export async function createJob(jobData: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(jobData),
  });
  if (!response.ok) throw new Error('Failed to create job');
  return response.json();
}

export async function getCandidates(jobId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/candidates/${jobId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch candidates');
  return response.json();
}

export async function uploadCandidatesCsv(jobId: string, file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/candidates/csv`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload CSV');
  return response.json();
}
export async function bulkRecruitment(formData: FormData, token: string) {
  const response = await fetch(`${API_BASE_URL}/recruitment/bulk`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to create recruitment pipeline');
  return response.json();
}

export async function deleteJob(jobId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete job');
  return response.json();
}

export async function generateJobInfo(title: string, location: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/admin/generate-job-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, location }),
  });
  if (!response.ok) throw new Error('Failed to generate job info');
  return response.json();
}

export async function getJobAnalytics(jobId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/admin/analytics/${jobId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch job analytics');
  return response.json();
}

