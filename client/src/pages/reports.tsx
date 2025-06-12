import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, History, AlertTriangle, Download, FileBarChart, FileSpreadsheet } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("inventory");
  const [dateRange, setDateRange] = useState("30days");
  const [format, setFormat] = useState("pdf");

  const handleGenerateReport = () => {
    // TODO: Implement report generation
    console.log("Generating report:", { reportType, dateRange, format });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal mb-2">Reports & Analytics</h2>
        <p className="text-gray-600">Generate comprehensive reports and audit trails</p>
      </div>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="elevation-1">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="military-blue w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="text-white" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">Inventory Report</h3>
              <p className="text-sm text-gray-600 mb-4">Complete inventory status and calibration summary</p>
              <Button className="w-full military-blue" onClick={handleGenerateReport}>
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-1">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="forest-green w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <History className="text-white" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">Chain of Custody</h3>
              <p className="text-sm text-gray-600 mb-4">Full audit trail for specific scales or date ranges</p>
              <Button className="w-full forest-green" onClick={handleGenerateReport}>
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-1">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="amber-warning w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-white" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">Compliance Report</h3>
              <p className="text-sm text-gray-600 mb-4">Calibration status and compliance violations</p>
              <Button className="w-full amber-warning" onClick={handleGenerateReport}>
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Report Builder */}
      <Card className="elevation-1 mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Custom Report Builder</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Inventory Summary</SelectItem>
                  <SelectItem value="assignments">Assignment History</SelectItem>
                  <SelectItem value="calibration">Calibration Status</SelectItem>
                  <SelectItem value="usage">Usage Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full military-blue" onClick={handleGenerateReport}>
                <Download className="mr-2" size={16} />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="elevation-1">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Recent Reports</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="military-blue w-10 h-10 rounded-lg flex items-center justify-center">
                  <FileBarChart className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">Monthly Inventory Report - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  <p className="text-xs text-gray-500">Generated {new Date().toLocaleDateString()} by Admin Smith</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-military-blue hover:text-blue-700">
                  Download
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                  View
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="forest-green w-10 h-10 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">Chain of Custody - Unit Alpha</p>
                  <p className="text-xs text-gray-500">Generated {new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()} by Tech. Williams</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-military-blue hover:text-blue-700">
                  Download
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                  View
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="amber-warning w-10 h-10 rounded-lg flex items-center justify-center">
                  <FileBarChart className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">Calibration Compliance Report</p>
                  <p className="text-xs text-gray-500">Generated {new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString()} by Auditor Davis</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-military-blue hover:text-blue-700">
                  Download
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                  View
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
