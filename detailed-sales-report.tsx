import React, { useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DetailedReport = ({ customers = [], packageSales = [] }) => {
  // 查詢日期範圍狀態
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // 本月第一天
    endDate: new Date().toISOString().split('T')[0] // 今天
  });

  // 計算指定日期範圍的報表數據
  const calculateReport = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59); // 設定結束時間為當天最後一刻

    // 過濾日期範圍內的數據
    const filteredCustomers = customers.filter(customer => {
      const checkInDate = new Date(customer.checkInTime);
      return checkInDate >= start && checkInDate <= end;
    });

    const filteredPackages = packageSales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= start && saleDate <= end;
    });

    // 按日期分組的營收數據
    const dailyRevenue = {};
    filteredCustomers.forEach(customer => {
      const date = new Date(customer.checkInTime).toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = {
          date,
          cashIncome: 0,
          overtimeIncome: 0,
          ticketUsage: 0,
          customerCount: 0
        };
      }

      if (customer.payment === 'cash') {
        dailyRevenue[date].cashIncome += Number(customer.cashAmount) || 0;
      }
      if (customer.overtimeCharge) {
        dailyRevenue[date].overtimeIncome += customer.overtimeCharge;
      }
      if (customer.payment === 'ticket') {
        dailyRevenue[date].ticketUsage += 1;
      }
      dailyRevenue[date].customerCount += 1;
    });

    // 計算總計
    const totals = {
      cashIncome: filteredCustomers
        .filter(c => c.payment === 'cash')
        .reduce((sum, c) => sum + (Number(c.cashAmount) || 0), 0),
      packageIncome: filteredPackages
        .reduce((sum, p) => sum + p.amount, 0),
      overtimeIncome: filteredCustomers
        .reduce((sum, c) => sum + (c.overtimeCharge || 0), 0),
      customerCount: filteredCustomers.length,
      ticketUsageCount: filteredCustomers
        .filter(c => c.payment === 'ticket').length,
      packageSaleCount: filteredPackages
        .reduce((sum, p) => sum + p.quantity, 0)
    };

    return {
      dailyRevenue: Object.values(dailyRevenue).sort((a, b) => a.date.localeCompare(b.date)),
      totals
    };
  };

  const report = calculateReport();

  return (
    <div className="space-y-6">
      {/* 日期選擇器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            選擇查詢日期範圍
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <label className="block mb-1">起始日期</label>
              <input
                type="date"
                className="p-2 border rounded"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block mb-1">結束日期</label>
              <input
                type="date"
                className="p-2 border rounded"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 總計數據 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            營業總覽
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-bold mb-2">現金收入</h3>
              <p className="text-2xl">${report.totals.cashIncome}</p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <h3 className="font-bold mb-2">套票收入</h3>
              <p className="text-2xl">${report.totals.packageIncome}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded">
              <h3 className="font-bold mb-2">超時收入</h3>
              <p className="text-2xl">${report.totals.overtimeIncome}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded">
              <h3 className="font-bold mb-2">總收入</h3>
              <p className="text-2xl">${report.totals.cashIncome + report.totals.packageIncome + report.totals.overtimeIncome}</p>
            </div>
            <div className="p-4 bg-red-50 rounded">
              <h3 className="font-bold mb-2">入場人數</h3>
              <p className="text-2xl">{report.totals.customerCount} 人</p>
              <p className="text-sm text-gray-600">
                現金: {report.totals.customerCount - report.totals.ticketUsageCount} 人
                <br />
                套票: {report.totals.ticketUsageCount} 人
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded">
              <h3 className="font-bold mb-2">套票銷售</h3>
              <p className="text-2xl">{report.totals.packageSaleCount} 張</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 每日營收明細 */}
      <Card>
        <CardHeader>
          <CardTitle>每日營收明細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">日期</th>
                  <th className="p-3 text-right">現金收入</th>
                  <th className="p-3 text-right">超時收入</th>
                  <th className="p-3 text-right">套票使用</th>
                  <th className="p-3 text-right">入場人數</th>
                </tr>
              </thead>
              <tbody>
                {report.dailyRevenue.map(day => (
                  <tr key={day.date} className="border-t">
                    <td className="p-3">{new Date(day.date).toLocaleDateString()}</td>
                    <td className="p-3 text-right">${day.cashIncome}</td>
                    <td className="p-3 text-right">${day.overtimeIncome}</td>
                    <td className="p-3 text-right">{day.ticketUsage} 次</td>
                    <td className="p-3 text-right">{day.customerCount} 人</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td className="p-3">總計</td>
                  <td className="p-3 text-right">${report.totals.cashIncome}</td>
                  <td className="p-3 text-right">${report.totals.overtimeIncome}</td>
                  <td className="p-3 text-right">{report.totals.ticketUsageCount} 次</td>
                  <td className="p-3 text-right">{report.totals.customerCount} 人</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedReport;
