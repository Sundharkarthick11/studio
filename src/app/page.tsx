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
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  vibration: boolean;
  latitude: number;
  longitude: number;
  speed: number;
  altitude: number;
  satellites: number;
  totalAccel: number;
  dadt: number;
}

function generateCSV(data: SensorData[]): string {
  const header = 'Timestamp,AccelerationX,AccelerationY,AccelerationZ,Vibration,Latitude,Longitude,Speed,Altitude,Satellites\n';
  const rows = data.map(item =>
    `${item.timestamp},${item.accelerationX},${item.accelerationY},${item.accelerationZ},${item.vibration},${item.latitude},${item.longitude},${item.speed},${item.altitude},${item.satellites}`
  )
  return header + rows.join('\n');
}

export default function Home() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const {toast} = useToast()

  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sensor-data-2', {method: "GET"});
        if (response.ok) {
           const newData = await response.json();
          if (newData) {
               setSensorData(prevData => {
              const latestData = {
                timestamp: new Date().toLocaleTimeString(),
                accelerationX: newData.accelerationX,
                accelerationY: newData.accelerationY,
                accelerationZ: newData.accelerationZ,
                vibration: newData.vibration,
                latitude: newData.latitude,
                longitude: newData.longitude,
                speed: newData.speed,
                altitude: newData.altitude,
                satellites: newData.satellites,
                totalAccel: newData.totalAccel,
                dadt: newData.dadt,
              };
                 if (latestData.dadt > 20 && latestData.totalAccel < 5) {
            setMessage("⚠️ Sudden da/dt change detected! Object stopped abruptly.");

          } else {
                setMessage("");
          }
              return [latestData, ...prevData.slice(0, 19)];
            });
          }
        } else {
          console.error('Failed to fetch sensor data');
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        if (
    };

    fetchData(); // Initial fetch

    const intervalId = setInterval(fetchData, 5000); // Update every 5 seconds

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
        <h1 className="text-2xl font-bold">Sensor Status</h1>
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

      <div className="text-red-500">{message}</div>

      <Separator className="mb-4"/>

      <section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Acceleration</CardTitle>
            <CardDescription>Real-time acceleration data</CardDescription>
          </CardHeader>
          
          <CardContent >
          <div className="flex items-center justify-between">
          <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sensorData.length > 0 ? sensorData : []}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="timestamp"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                 <Line type="monotone" dataKey="accelerationX" stroke="#8884d8" name="Acceleration X"/>
                <Line type="monotone" dataKey="accelerationY" stroke="#82ca9d" name="Acceleration Y"/>
                <Line type="monotone" dataKey="accelerationZ" stroke="#ffc658" name="Acceleration Z"/>
              </LineChart>
            </ResponsiveContainer>
            
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={sensorData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="dadt"
                        stroke="#82ca9d"
                        name="Rate of change of acceleration"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
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
                <Line type="monotone" dataKey="altitude" stroke="#00FF00" name="Altitude"/>
                <Line type="monotone" dataKey="speed" stroke="#FF00FF" name="Speed"/>
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
              <TableHead>Acceleration X</TableHead>
              <TableHead>Acceleration Y</TableHead>
              <TableHead>Acceleration Z</TableHead>
              <TableHead>Total Acceleration</TableHead>
              <TableHead>da/dt</TableHead>
              <TableHead>Vibration</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Speed</TableHead>
              <TableHead>Altitude</TableHead>
              <TableHead>Satellites</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sensorData.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{data.timestamp}</TableCell>
                <TableCell>{data.accelerationX.toFixed(2)}</TableCell>
                <TableCell>{data.accelerationY.toFixed(2)}</TableCell>
                <TableCell>{data.accelerationZ.toFixed(2)}</TableCell>
                <TableCell>{data.totalAccel.toFixed(2)}</TableCell>
                <TableCell>{data.dadt.toFixed(2)}</TableCell>
                <TableCell>{data.vibration ? 'Yes' : 'No'}</TableCell>
                <TableCell>{data.latitude.toFixed(6)}</TableCell>
                <TableCell>{data.longitude.toFixed(6)}</TableCell>
                 <TableCell>{data.speed.toFixed(2)}</TableCell>
                <TableCell>{data.altitude.toFixed(2)}</TableCell>
                <TableCell>{data.satellites}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      
    </div>
  );
}
