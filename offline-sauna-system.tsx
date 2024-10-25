import React, { useState, useEffect } from 'react';
import { Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OfflineSaunaSystem = () => {
  // 基本狀態管理
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('saunaCustomers');
    return saved ? JSON.parse(saved) : [];
  });

  const [lockers, setLockers] = useState(() => {
    const saved = localStorage.getItem('saunaLockers');
    return saved ? JSON.parse(saved) : Array(50).fill(null);
  });

  // 入場表單狀態
  const [formData, setFormData] = useState({
    lockerNumber: '',
    ticketNumber: '',
    payment: 'cash',
    cashAmount: '',
    ticketType: 'regular',
    customerName: '',
    notes: ''
  });

  // 同步到 localStorage
  useEffect(() => {
    localStorage.setItem('saunaCustomers', JSON.stringify(customers));
    localStorage.setItem('saunaLockers', JSON.stringify(lockers));
  }, [customers, lockers]);

  // 票價選項
  const ticketTypes = [
    { value: 'regular', label: '一般票 $500', price: 500 },
    { value: 'morning', label: '早場票 $350', price: 350 }
  ];

  // 入場處理
  const handleCheckIn = () => {
    if (!formData.lockerNumber) {
      alert('請輸入置物櫃號碼');
      return;
    }

    const newCustomer = {
      id: Date.now(),
      lockerNumber: formData.lockerNumber,
      checkInTime: new Date().toISOString(),
      payment: formData.payment,
      cashAmount: formData.payment === 'cash' ? Number(formData.cashAmount) : null,
      ticketNumber: formData.ticketNumber,
      ticketType: formData.ticketType,
      customerName: formData.customerName,
      notes: formData.notes,
      expenses: [],
      isCheckedOut: false
    };

    setCustomers([...customers, newCustomer]);
    
    const newLockers = [...lockers];
    newLockers[formData.lockerNumber - 1] = newCustomer.id;
    setLockers(newLockers);

    setFormData({
      lockerNumber: '',
      ticketNumber: '',
      payment: 'cash',
      cashAmount: '',
      ticketType: 'regular',
      customerName: '',
      notes: ''
    });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">三溫暖管理系統（離線版）</h1>
      
      {/* 入場登記表單 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>入場登記</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <label className="block mb-1">置物櫃號碼</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.lockerNumber}
                onChange={(e) => setFormData({...formData, lockerNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block mb-1">客人姓名</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              />
            </div>
            <div>
              <label className="block mb-1">票種選擇</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.ticketType}
                onChange={(e) => setFormData({...formData, ticketType: e.target.value})}
              >
                {ticketTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">付款方式</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.payment}
                onChange={(e) => setFormData({...formData, payment: e.target.value})}
              >
                <option value="cash">現金</option>
                <option value="ticket">票券</option>
              </select>
            </div>
            {formData.payment === 'cash' && (
              <div>
                <label className="block mb-1">現金金額</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={formData.cashAmount}
                  onChange={(e) => setFormData({...formData, cashAmount: e.target.value})}
                  placeholder={`請輸入金額 (${ticketTypes.find(t => t.value === formData.ticketType).price}元)`}
                />
              </div>
            )}
            {formData.payment === 'ticket' && (
              <div>
                <label className="block mb-1">票券號碼</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.ticketNumber}
                  onChange={(e) => setFormData({...formData, ticketNumber: e.target.value})}
                />
              </div>
            )}
            <div>
              <label className="block mb-1">備註</label>
              <textarea
                className="w-full p-2 border rounded"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <button
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              onClick={handleCheckIn}
            >
              確認入場
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 在場客人列表 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>在場客人</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {customers
              .filter(customer => !customer.isCheckedOut)
              .map(customer => (
                <div key={customer.id} className="border p-4 rounded">
                  <div className="flex justify-between mb-2">
                    <span>櫃號: {customer.lockerNumber}</span>
                    <span>姓名: {customer.customerName}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>入場時間: {new Date(customer.checkInTime).toLocaleTimeString()}</p>
                    <p>付款方式: {customer.payment === 'cash' ? '現金' : '票券'}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* 置物櫃狀態 */}
      <Card>
        <CardHeader>
          <CardTitle>置物櫃狀態</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {lockers.map((customerId, index) => (
              <div
                key={index}
                className={`p-2 text-center border rounded ${
                  customerId ? 'bg-red-100' : 'bg-green-100'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineSaunaSystem;
