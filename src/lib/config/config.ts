interface Config {
    base_url: string;
}

const configuration: Config = {
    base_url: import.meta.env.VITE_LOG_FRONTEND_BASE_URL || '',
};
  
export default configuration;