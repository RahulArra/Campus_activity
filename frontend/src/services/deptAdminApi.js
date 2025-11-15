import { API } from "../stores/authStore";

export async function getStudents(dept, params = {}) {
  return (await API.get(`/dept/${dept}/students`, { params })).data;
}

export async function getTeachers(dept, params = {}) {
  return (await API.get(`/dept/${dept}/teachers`, { params })).data;
}

export async function getOverview(dept) {
  return (await API.get(`/dept/${dept}/overview`)).data;
}

export async function exportDeptCSV(dept) {
  return API.get(`/dept/${dept}/export`, {
    responseType: "blob",
  });
}

export async function exportDeptPDF(dept) {
  return API.get(`/dept/${dept}/export/pdf`, {
    responseType: "blob",
  });
}

export async function getUploadSummary(dept) {
  return (await API.get(`/dept/${dept}/summary`)).data.summary;
}
