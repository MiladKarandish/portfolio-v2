export const download = async (server: string, task: string) => {
  const token = localStorage.getItem("pdf-key");

  const res = await fetch(`https://${server}/v1/download/${task}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.blob();

  const objectUrl = URL.createObjectURL(data);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.setAttribute("download", "MiladKarandish");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const process = async (server: string, task: string, server_filename: string) => {
  const token = localStorage.getItem("pdf-key");

  const res = await fetch(`https://${server}/v1/process`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task: task,
      tool: "htmlpdf",
      files: [
        {
          server_filename,
          filename: "MiladKarandish",
          output_filename: "MiladKarandish",
        },
      ],
      page_orientation: "portrait",
      page_margin: 20,
      view_width: 1440,
      page_size: "A4",
      single_page: false,
      output_filename: "{filename}",
      packaged_filename: "MiladKarandish",
    }),
  });

  await res.json();

  return await download(server, task);
};

export const upload = async (server: string, task: string) => {
  const token = localStorage.getItem("pdf-key");

  const res = await fetch(`https://${server}/v1/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task: task,
      cloud_file: "https://portfolio-v2-xi-tan.vercel.app/resume",
    }),
  });
  const data = await res.json();

  return await process(server, task, data.server_filename);
};

export const start = async () => {
  const token = localStorage.getItem("pdf-key");

  const res = await fetch("https://api.ilovepdf.com/v1/start/htmlpdf", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  return await upload(data.server, data.task);
};

export const auth = async () => {
  const res = await fetch("https://api.ilovepdf.com/v1/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      public_key: "project_public_f76b994d501b08b7e05419d681e15c3a_Q6clf53c3c6280291ef27b08a19558cbe4414",
    }),
  });

  const data = await res.json();

  if (data) {
    localStorage.setItem("pdf-key", data.token);
  }

  return await start();
};
