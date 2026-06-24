import { createContext } from 'react';
export const CmsContext = createContext({ cms: {}, reloadCms: () => {} });
export default CmsContext;
