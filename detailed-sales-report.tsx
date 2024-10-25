<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>三溫暖管理系統</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        function App() {
            const [activeTab, setActiveTab] = React.useState('entrance'); // entrance, package, report
            const [customers, setCustomers] = React.useState(() => {
                const saved = localStorage.getItem('saunaCustomers');
                return saved ? JSON.parse(saved) : [];
            });

            const [packageSales, setPackageSales] = React.useState(() => {
                const saved = localStorage.getItem('saunaPackages');
                return saved ? JSON.parse(saved) : [];
            });

            const [lockers, setLockers] = React.useState(() => {
                const saved = localStorage.getItem('saunaLockers');
                return saved ? JSON.parse(saved) : Array(50).fill(null);
            });

            // 儲存到 localStorage
            React.useEffect(() => {
                localStorage.setItem('saunaCustomers', JSON.stringify(customers));
                localStorage.setItem('saunaPackages', JSON.stringify(packageSales));
                localStorage.setItem('saunaLockers', JSON.stringify(lockers));
            }, [customers, packageSales, lockers]);

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
                <div className="min-h-screen bg-gray-100">
                    {/* 頁面導航 */}
                    <nav className="bg-white shadow-md p-4 mb-6">
                        <div className="max-w-7xl mx-auto flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-800">三溫暧管理系統</h1>
                            <div className="flex gap-4 items-center">
                                <button 
                                    onClick={() => setActiveTab('entrance')}
                                    className={`px-4 py-2 rounded ${activeTab === 'entrance' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                >
                                    入場管理
                                </button>
                                <button 
                                    onClick={() => setActiveTab('package')}
                                    className={`px-4 py-2 rounded ${activeTab === 'package' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                >
                                    套票管理
                                </button>
                                <button 
                                    onClick={() => setActiveTab('report')}
                                    className={`px-4 py-2 rounded ${activeTab === 'report' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                >
                                    營業報表
                                </button>
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
                    </nav>

                    {/* 主要內容區域 */}
                    <div className="max-w-7xl mx-auto p-4">
                        {/* 這裡會放入各個頁面元件 */}
                    </div>
                </div>
            );
        }

```jsx
// 入場管理元件
function EntranceSystem({ customers, setCustomers, lockers, setLockers }) {
    const [formData, setFormData] = React.useState({
        lockerNumber: '',
        ticketNumber: '',
        payment: 'cash',
        cashAmount: '',
        ticketType: 'regular',
        customerName: '',
        notes: ''
    });

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

        if (formData.payment === 'cash' && !formData.cashAmount) {
            alert('請輸入現金金額');
            return;
        }

        // 檢查櫃號是否已被使用
        if (lockers[formData.lockerNumber - 1]) {
            alert('此置物櫃已被使用');
            return;
        }

        const newCustomer = {
            id: Date.now(),
            ...formData,
            checkInTime: new Date().toISOString(),
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

        alert('入場登記成功！');
    };

    // 計算超時費用
    const calculateOvertime = (checkInTime) => {
        const duration = (new Date() - new Date(checkInTime)) / (1000 * 60 * 60);
        const overtime = Math.max(0, duration - 3);
        return Math.ceil(overtime) * 100;
    };

    // 處理結帳離場
    const handleCheckOut = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;

        const overtimeCharge = calculateOvertime(customer.checkInTime);
        const totalExpenses = customer.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const finalBill = totalExpenses + overtimeCharge;

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

        const newLockers = [...lockers];
        newLockers[customer.lockerNumber - 1] = null;
        setLockers(newLockers);

        alert(`
            結帳明細：
            基本消費：${totalExpenses}元
            超時費用：${overtimeCharge}元
            總計金額：${finalBill}元
        `);
    };

    return (
        <div className="space-y-6">
            {/* 入場登記表單 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">入場登記</h2>
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
            </div>

            {/* 在場客人列表 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">在場客人</h2>
                <div className="grid gap-4">
                    {customers
                        .filter(customer => !customer.isCheckedOut)
                        .map(customer => (
                            <div key={customer.id} className="border p-4 rounded">
                                <div className="flex justify-between mb-2">
                                    <span>櫃號: {customer.lockerNumber}</span>
                                    <span>姓名: {customer.customerName}</span>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                    <p>入場時間: {new Date(customer.checkInTime).toLocaleTimeString()}</p>
                                    <p>付款方式: {customer.payment === 'cash' ? '現金' : '票券'}</p>
                                    {customer.notes && <p>備註: {customer.notes}</p>}
                                </div>
                                <button
                                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 w-full"
                                    onClick={() => handleCheckOut(customer.id)}
                                >
                                    結帳離場
                                </button>
                            </div>
                        ))}
                </div>
            </div>

            {/* 置物櫃狀態 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">置物櫃狀態</h2>
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
            </div>
        </div>
    );
}
``````jsx
// 套票管理元件
function PackageSystem({ packageSales, setPackageSales, customers }) {
    const [packageForm, setPackageForm] = React.useState({
        amount: '',
        ticketNumbers: '',
        customerName: '',
        quantity: '',
        notes: ''
    });

    // 處理套票購買
    const handlePackageSale = () => {
        if (!packageForm.amount || !packageForm.customerName || !packageForm.quantity) {
            alert('請填寫完整的套票資訊');
            return;
        }

        if (!packageForm.ticketNumbers) {
            alert('請輸入票券號碼');
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

    // 計算已使用次數
    const calculateUsedTickets = (ticketNumbers) => {
        return customers.filter(c => 
            c.payment === 'ticket' && 
            ticketNumbers.includes(c.ticketNumber)
        ).length;
    };

    // 顯示使用歷史
    const showUsageHistory = (ticketNumbers) => {
        const usageHistory = customers
            .filter(c => c.payment === 'ticket' && ticketNumbers.includes(c.ticketNumber))
            .map(c => ({
                date: new Date(c.checkInTime).toLocaleDateString(),
                time: new Date(c.checkInTime).toLocaleTimeString(),
                customerName: c.customerName,
                ticketNumber: c.ticketNumber
            }));

        if (usageHistory.length === 0) {
            alert('尚無使用記錄');
            return;
        }

        const historyText = usageHistory
            .map(h => `日期：${h.date}\n時間：${h.time}\n使用者：${h.customerName}\n票號：${h.ticketNumber}`)
            .join('\n\n');

        alert(`使用記錄：\n\n${historyText}`);
    };

    return (
        <div className="space-y-6">
            {/* 套票購買表單 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">套票購買</h2>
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
                            placeholder="例：A001, A002, A003"
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
            </div>

            {/* 套票使用狀況 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">套票使用狀況</h2>
                <div className="grid gap-4">
                    {packageSales.map(pkg => (
                        <div key={pkg.id} className="border p-4 rounded">
                            <div className="flex justify-between">
                                <span>購買人：{pkg.customerName}</span>
                                <span>剩餘次數：{pkg.quantity - calculateUsedTickets(pkg.ticketNumbers)} / {pkg.quantity}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                                <p>購買日期：{new Date(pkg.saleDate).toLocaleDateString()}</p>
                                <p>票券號碼：{pkg.ticketNumbers}</p>
                                <p>購買金額：${pkg.amount}</p>
                                {pkg.notes && <p>備註：{pkg.notes}</p>}
                            </div>
                            <button
                                onClick={() => showUsageHistory(pkg.ticketNumbers)}
                                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                            >
                                查看使用記錄
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
``````jsx
// 營業報表元件
function ReportSystem({ customers, packageSales }) {
    const [dateRange, setDateRange] = React.useState({
        startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // 本月第一天
        endDate: new Date().toISOString().split('T')[0] // 今天
    });

    // 計算報表數據
    const calculateReport = () => {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59);

        // 過濾日期範圍內的數據
        const filteredCustomers = customers.filter(customer => {
            const checkInDate = new Date(customer.checkInTime);
            return checkInDate >= start && checkInDate <= end;
        });

        const filteredPackages = packageSales.filter(sale => {
            const saleDate = new Date(sale.saleDate);
            return saleDate >= start && saleDate <= end;
        });

        // 按日期分組的數據
        const dailyData = {};
        filteredCustomers.forEach(customer => {
            const date = new Date(customer.checkInTime).toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = {
                    date,
                    cashIncome: 0,
                    overtimeIncome: 0,
                    ticketUsage: 0,
                    customerCount: 0
                };
            }

            if (customer.payment === 'cash') {
                dailyData[date].cashIncome += Number(customer.cashAmount) || 0;
            }
            if (customer.overtimeCharge) {
                dailyData[date].overtimeIncome += customer.overtimeCharge;
            }
            if (customer.payment === 'ticket') {
                dailyData[date].ticketUsage += 1;
            }
            dailyData[date].customerCount += 1;
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
                .reduce((sum, p) => sum + Number(p.quantity), 0)
        };

        return {
            dailyData: Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)),
            totals
        };
    };

    const report = calculateReport();

    return (
        <div className="space-y-6">
            {/* 日期選擇 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">選擇日期範圍</h2>
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
            </div>

            {/* 總覽數據 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">營業總覽</h2>
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
                        <p className="text-2xl">
                            ${report.totals.cashIncome + report.totals.packageIncome + report.totals.overtimeIncome}
                        </p>
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
            </div>

            {/* 每日營收明細 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">每日營收明細</h2>
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
                            {report.dailyData.map(day => (
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
            </div>
        </div>
    );
}

// 最後在主應用程式中整合所有元件
function App() {
    // ... (之前的 App 元件代碼)

    return (
        <div className="min-h-screen bg-gray-100">
            {/* 導航區域 */}
            <nav className="bg-white shadow-md p-4 mb-6">
                {/* ... (之前的導航代碼) */}
            </nav>

            {/* 主要內容區域 */}
            <div className="max-w-7xl mx-auto p-4">
                {activeTab === 'entrance' && (
                    <EntranceSystem
                        customers={customers}
                        setCustomers={setCustomers}
                        lockers={lockers}
                        setLockers={setLockers}
                    />
                )}
                {activeTab === 'package' && (
                    <PackageSystem
                        packageSales={packageSales}
                        setPackageSales={setPackageSales}
                        customers={customers}
                    />
                )}
                {activeTab === 'report' && (
                    <ReportSystem
                        customers={customers}
                        packageSales={packageSales}
                    />
                )}
            </div>
        </div>
    );
}

// 渲染應用程式
ReactDOM.render(<App />, document.getElementById('root'));
```
