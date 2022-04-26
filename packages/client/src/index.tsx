
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'antd/dist/antd.less'; // or 'antd/dist/antd.less'

const root = createRoot(document.querySelector('#root') as Element);
root.render(<App />);
