
'use client';

import React, {useState, useEffect} from 'react';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {ArrowDownToLine, Copy, Download} from "lucide-react"
import {Separator} from "@/components/ui/separator"
import {useToast} from "@/hooks/use-toast"

interface SensorData {
  timestamp: string;
  acceleration: number;
  vibration: number;
  latitude: number;
  longitude: number;
}

const dummyData: SensorData[] = Array.from({length: 20}, (_, i) => ({
  timestamp: new Date(Date.now() - i * 60000).toLocaleTimeString(),
  acceleration: Math.random() * 10,
  vibration: Math.random() * 5,
  latitude: 34.0522 + Math.random() * 0.1,
  longitude: -118.2437 + Math.random() * 0.1,
}));

function generateCSV(data: SensorData[]): string {
  const header = 'Timestamp,Acceleration,Vibration,Latitude,Longitude\n';
  const rows = data.map(item =>
    `${item.timestamp},${item.acceleration},${item.vibration},${item.latitude},${item.longitude}`
  );
  return header + rows.join('\n');
}

export default function Home() {
  const [sensorData, setSensorData] = useState<SensorData[]>(dummyData);
  const {toast} = useToast()

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSensorData(prevData => [
        {
          timestamp: new Date().toLocaleTimeString(),
          acceleration: Math.random() * 10,
          vibration: Math.random() * 5,
          latitude: 34.0522 + Math.random() * 0.1,
          longitude: -118.2437 + Math.random() * 0.1,
        },
        ...prevData.slice(0, 19),
      ]);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  const handleDownload = () => {
    const csvData = generateCSV(sensorData);
    const blob = new Blob([csvData], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sensor_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const csvData = generateCSV(sensorData);
    navigator.clipboard.writeText(csvData);
    toast({
      title: "Copied to clipboard!",
      description: "CSV data copied to clipboard",
    })
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">SensorStats</h1>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4"/>
            Copy Data
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <ArrowDownToLine className="mr-2 h-4 w-4"/>
            Download CSV
          </Button>
        </div>
      </header>

      <Separator className="mb-4"/>

      <section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Acceleration</CardTitle>
            <CardDescription>Real-time acceleration data</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="timestamp"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <Line type="monotone" dataKey="acceleration" stroke="#8884d8" name="Acceleration"/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vibration</CardTitle>
            <CardDescription>Real-time vibration data</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="timestamp"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <Line type="monotone" dataKey="vibration" stroke="#82ca9d" name="Vibration"/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>GPS Coordinates</CardTitle>
            <CardDescription>Real-time GPS data</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="timestamp"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <Line type="monotone" dataKey="latitude" stroke="#ff7300" name="Latitude"/>
                <Line type="monotone" dataKey="longitude" stroke="#00a9ff" name="Longitude"/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="overflow-x-auto">
        <Table>
          <TableCaption>Recent sensor data.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Acceleration</TableHead>
              <TableHead>Vibration</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sensorData.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{data.timestamp}</TableCell>
                <TableCell>{data.acceleration.toFixed(2)}</TableCell>
                <TableCell>{data.vibration.toFixed(2)}</TableCell>
                <TableCell>{data.latitude.toFixed(6)}</TableCell>
                <TableCell>{data.longitude.toFixed(6)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      
    </div>
  );
}
