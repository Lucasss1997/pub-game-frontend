import React, { useState } from 'react';
import TopNav from '../components/TopNav';
import { api } from '../lib/api';

export default function WhatsInTheBox() {
  const [status, setStatus] = useState('');
 