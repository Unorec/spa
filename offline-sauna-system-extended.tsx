import React, { useState, useEffect } from 'react';
import { Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OfflineSaunaSystem = () => {
  // 基本狀態管理
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('saunaCustomers');
    return saved ? JSON.parse(saved) : [];
  });

  const [packageSales, setPackageSales] = useState(() => {
    const saved = localStorage.getItem('saunaPackages');
    return saved ? JSON.parse(saved) : [];
  });

  const [lockers, setLockers] = useState(() => {
    const saved = localStorage.getItem('saunaLockers');
    return saved ? JSON.parse(saved) : Array(50).fill(null);
  });

  // 表單狀態
  const [formData, setFormData] = useState({
    lockerNumber: '',
    ticketNumber: '',
    payment: 'cash',
    cashAmount: '',
    ticketType: 'regular',
    customerName: '',
    notes: ''
  });

  // 套票表單狀態
  const [packageForm, setPackageForm] = useState({
    amount: '',
    ticketNumbers: '',
    customerName: '',
    quantity: '',
    notes: ''
  });

  // 同步到 localStorage
  useEffect(() => {
    localStorage.setItem('saunaCustomers', JSON.stringify(customers));
    localStorage.setItem('saunaPackages', JSON.stringify(packageSales));
    localStorage.setItem('saunaLockers', JSON.stringify(lockers));
  }, [customers, packageSales, lockers]);

  // 票價選項
  const ticketTypes = [
    { value: 'regular', label: '一般票 $500', price: 500 },
    { value: 'morning', label: '早場票 $350', price: 350 }
  ];

  // 計算超時費用
  const calculateOvertime = (checkInTime) => {
    const duration = (new Date() - new Date(checkInTime)) / (1000 * 60 * 60);
    const overtime = Math.max(0, duration - 3);
    return Math.ceil(overtime) * 100;
  };

  // 處理套票購買
  const handlePackageSale = () => {
    if (!packageForm.amount || !packageForm.customerName || !packageForm.quantity) {
      alert('請填寫完整的套票資訊');
      return;
    }

    const newSale = {
      id: Date.now(),
      ...packageForm,
      saleDate: new Date().toISOString(),
      amount: Number(packageForm.amount),
      quantity: Number(packageForm.quantity),
      remaining: Number(packageForm.quantity)
    };

    setPackageSales([...packageSales, newSale]);
    setPackageForm({
      amount: '',
      ticketNumbers: '',
      customerName: '',
      quantity: '',
      notes: ''
    });

    alert('套票購買成功！');
  };

  // 處理結帳
  const handleCheckOut = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const overtimeCharge = calculateOvertime(customer.checkInTime);
    const totalExpenses = customer.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const finalBill = totalExpenses + overtimeCharge;

    // 更新客人狀態
    setCustomers(customers.map(c => {
      if (c.id === customerId) {
        return { 
          ...c, 
          isCheckedOut: true, 
          checkOutTime: new Date().toISOString(),
          overtimeCharge,
          finalBill
        };
      }
      return c;
    }));

    // 釋放置物櫃
    const newLockers = [...lockers];
    newLockers[customer.lockerNumber - 1] = null;
    setLockers(newLockers);

    // 如果使用套票，更新套票剩餘次數
    if (customer.payment === 'ticket' && customer.ticketNumber) {
      setPackageSales(packageSales.map(pkg => {
        if (pkg.ticketNumbers.includes(customer.ticketNumber)) {
          return { ...pkg, remaining: pkg.remaining - 1 };
        }
        return pkg;
      }));
    }

    alert(`
      結帳明細：
      基本消費：${totalExpenses}元
      超時費用：${overtimeCharge}元
      總計金額：${finalBill}元
    `);
  };

  // 匯出數據
  const handleExport = () => {
    const data = {
      customers,
      packageSales,
      lockers,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sauna-data-${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 匯入數據
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.customers) setCustomers(data.customers);
          if (data.packageSales) setPackageSales(data.packageSales);
          if (data.lockers) setLockers(data.lockers);
          alert('數據匯入成功！');
        } catch (error) {
          alert('數據格式錯誤，請確認檔案格式正確。');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">三溫暖管理系統（離線版）</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            匯出數據
          </button>
          <label className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer">
            匯入數據
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        </div>
      </div>

      {/* 套票購買表單 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>套票購買</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <label className="block mb-1">購買人姓名</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={packageForm.customerName}
                onChange={(e) => setPackageForm({...packageForm, customerName: e.target.value})}
              />
            </div>
            <div>
              <label className="block mb-1">購買金額</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={packageForm.amount}
                onChange={(e) => setPackageForm({...packageForm, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block mb-1">購買張數</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={packageForm.quantity}
                onChange={(e) => setPackageForm({...packageForm, quantity: e.target.value})}
              />
            </div>
            <div>
              <label className="block mb-1">票券號碼（多張用逗號分隔）</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={packageForm.ticketNumbers}
                onChange={(e) => setPackageForm({...packageForm, ticketNumbers: e.target.value})}
              />
            </div>
            <div>
              <label className="block mb-1">備註</label>
              <textarea
                className="w-full p-2 border rounded"
                value={packageForm.notes}
                onChange={(e) => setPackageForm({...packageForm, notes: e.target.value})}
              />
            </div>
            <button
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              onClick={handlePackageSale}
            >
              確認購買
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 套票使用狀況 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>套票使用狀況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {packageSales.map(pkg => (
              <div key={pkg.id} className="border p-4 rounded">
                <div className="flex justify-between">
                  <span>購買人：{pkg.customerName}</span>
                  <span>剩餘次數：{pkg.remaining}/{pkg.quantity}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <p>購買日期：{new Date(pkg.saleDate).toLocaleDateString()}</p>
                  <p>票券號碼：{pkg.ticketNumbers}</p>
                  <p>購買金額：${pkg.amount}</p>
                  {pkg.notes && <p>備註：{pkg.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 今日營業報表 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>今日營業概況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-bold mb-2">現金收入</h3>
              <p className="text-2xl">
                ${customers
                  .filter(c => 
                    c.payment === 'cash' && 
                    new Date(c.checkInTime).toDateString() === new Date().toDateString()
                  )
                  .reduce((sum, c) => sum + (Number(c.cashAmount) || 0), 0)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <h3 className="font-bold mb-2">套票收入</h3>
              <p className="text-2xl">
                ${packageSales
                  .filter(p => 
                    new Date(p.saleDate).toDateString() === new Date().toDateString()
                  )
                  .reduce((sum, p) => sum + p.amount, 0)}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded">
              <h3 className="font-bold mb-2">超時收入</h3>
              <p className="text-2xl">
                ${customers
                  .filter(c => 
                    c.isCheckedOut && 
                    new Date(c.checkOutTime).toDateString() === new Date().toDateString()
                  )
                  .reduce((sum, c) => sum + (c.overtimeCharge || 0), 0)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded">
              <h3 className="font-bold mb-2">今日入場</h3>
              <p className="text-2xl">
                {customers.filter(c => 
                  new Date(c.checkInTime).toDateString() === new Date().toDateString()
                ).length} 人
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineSaunaSystem;
