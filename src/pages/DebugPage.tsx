/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/DebugPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';

const DebugPage: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [envVars, setEnvVars] = useState<any>({});
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      url: import.meta.env.VITE_SUPABASE_URL || 'MISSING',
      key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
    });

    testConnection();
  }, []);

  const testConnection = async () => {
    const results: string[] = [];
    
    try {
      results.push('✅ Supabase client initialized');
      
      // Test 1: Basic connection
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, error } = await supabase.from('channels').select('count');
      
      if (error) {
        results.push(`❌ Database error: ${error.message}`);
        results.push(`❌ Error code: ${error.code}`);
        results.push(`❌ Error details: ${error.details}`);
        setConnectionStatus('Connection Failed');
      } else {
        results.push('✅ Database connection successful');
        results.push(`✅ Channels table accessible`);
        setConnectionStatus('Connected');
      }
      
    } catch (err: any) {
      results.push(`❌ Connection error: ${err.message}`);
      setConnectionStatus('Error');
    }
    
    setTestResults(results);
  };

//   const createTables = async () => {
//     try {
//       const results: string[] = [];
      
//       // Try to create enum types
//       const enumSql = `
//         DO $$ BEGIN
//           CREATE TYPE tag_type AS ENUM ('VF', 'VOSTFR', 'VA', 'VOSTA');
//         EXCEPTION
//           WHEN duplicate_object THEN null;
//         END $$;
        
//         DO $$ BEGIN
//           CREATE TYPE channel_type AS ENUM ('Mix', 'Only');
//         EXCEPTION
//           WHEN duplicate_object THEN null;
//         END $$;
//       `;
      
//       const { error: enumError } = await supabase.rpc('exec_sql', { sql: enumSql });
      
//       if (enumError) {
//         results.push(`❌ Enum creation failed: ${enumError.message}`);
//       } else {
//         results.push('✅ Enums created/verified');
//       }
      
//       setTestResults(prev => [...prev, ...results]);
      
//     } catch (err: any) {
//       setTestResults(prev => [...prev, `❌ Table creation error: ${err.message}`]);
//     }
//   };

  const testInsert = async () => {
    try {
      const testData = {
        youtube_url: 'https://youtube.com/@test',
        username: '@test',
        subscriber_count: 1000,
        tag: 'VF' as const,
        type: 'Mix' as const,
      };

      const { data, error } = await supabase
        .from('channels')
        .insert(testData)
        .select();

      if (error) {
        setTestResults(prev => [...prev, `❌ Insert failed: ${error.message}`]);
      } else {
        setTestResults(prev => [...prev, '✅ Test insert successful']);
        
        // Clean up test data
        if (data && data[0]) {
          await supabase.from('channels').delete().eq('id', data[0].id);
          setTestResults(prev => [...prev, '✅ Test data cleaned up']);
        }
      }
    } catch (err: any) {
      setTestResults(prev => [...prev, `❌ Insert error: ${err.message}`]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Supabase Connection Debug
          </h1>

          {/* Environment Variables */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>VITE_SUPABASE_URL:</strong>
                  <span className={envVars.url === 'MISSING' ? 'text-red-600' : 'text-green-600'}>
                    {envVars.url}
                  </span>
                </div>
                <div>
                  <strong>VITE_SUPABASE_ANON_KEY:</strong>
                  <span className={envVars.key === 'MISSING' ? 'text-red-600' : 'text-green-600'}>
                    {envVars.key}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className={`p-4 rounded-lg ${
              connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' :
              connectionStatus === 'Testing...' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {connectionStatus}
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              {testResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={testConnection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Test Connection
            </Button>
            
            <Button
              onClick={testInsert}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            >
              Test Insert
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1">
              <li>Make sure your <code>.env</code> file is configured correctly</li>
              <li>Run the SQL schema in your Supabase SQL Editor</li>
              <li>Test the connection using the buttons above</li>
              <li>Check the browser console for additional error details</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;