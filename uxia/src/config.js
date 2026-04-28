const config = {
  development: {
    API_URL: "http://localhost:8000",
    DEBUG: true,
  },
  production: {
    API_URL: "https://uxiaweb2.ieti.site",
    DEBUG: false,
  },
};

const mode = import.meta.env.MODE; 

export default config[mode] || config.development;