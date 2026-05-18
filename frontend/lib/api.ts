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

export async function getJobs(token?: string) {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
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

export async function updateProfile(profileData: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
}

export async function generateResume(token: string) {
  const response = await fetch(`${API_BASE_URL}/auth/generate-resume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) throw new Error('Failed to generate resume');
  return response.json();
}
export async function uploadProfilePicture(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/auth/profile-picture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload picture');
  return response.json();
}

export async function getAdminStats(token: string) {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function getAllCandidates(token: string) {
  const response = await fetch(`${API_BASE_URL}/admin/all-candidates`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) throw new Error('Failed to fetch candidates');
  return response.json();
}

export async function getAnalytics(token: string) {
  const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

export async function parseJD(jdText: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/admin/parse-jd`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ jd_text: jdText }),
  });
  if (!response.ok) throw new Error('Failed to parse JD');
  return response.json();
}

export async function generateQuestions(jobRole: string, skills: string[], token: string) {
  const response = await fetch(`${API_BASE_URL}/admin/generate-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ job_role: jobRole, skills }),
  });
  if (!response.ok) throw new Error('Failed to generate questions');
  return response.json();
}

export async function buildVoiceResume(audioBlob: Blob, token: string) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'resume_voice.webm');

  const response = await fetch(`${API_BASE_URL}/auth/voice-resume`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to build voice resume');
  return response.json();
}

export async function applyJob(jobId: string, resumeFile: File | null = null, token: string) {
  const formData = new FormData();
  formData.append('job_id', jobId);
  if (resumeFile) {
    formData.append('resume', resumeFile);
  }

  const response = await fetch(`${API_BASE_URL}/candidate/apply`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to apply for job');
  return response.json();
}

export async function evaluateCandidate(candidateId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/candidate/${candidateId}/evaluate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to evaluate candidate');
  return response.json();
}
