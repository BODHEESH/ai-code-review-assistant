
// // pages/profile.js

export default function Profile() {
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [threads, setThreads] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [filteredChatThreads, setFilteredChatThreads] = useState([]);
    const [filteredCodeReviewThreads, setFilteredCodeReviewThreads] = useState([]);
    const [totalChats, setTotalChats] = useState(0);
    const [totalCodeReviews, setTotalCodeReviews] = useState(0);
    const [totalResponses, setTotalResponses] = useState(0);
    const [chatCodeReviewPercentage, setChatCodeReviewPercentage] = useState({ chat: 0, codeReview: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editedUserData, setEditedUserData] = useState(null);
    const [activityData, setActivityData] = useState([]);
    const [skillDistributionData, setSkillDistributionData] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                try {
                    // Fetch user data
                    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                    console.log(userDoc, "user doc logged in")
                    if (userDoc.exists()) {
                        const fetchedUserData = userDoc.data();
                        setUserData(fetchedUserData);
                        setEditedUserData(fetchedUserData);

                        // Fetch threads
                        const threadsRef = collection(db, "threads");
                        const q = query(
                            threadsRef,
                            where("userId", "==", auth.currentUser.uid),
                            orderBy("createdAt", "desc")
                        );
                        const querySnapshot = await getDocs(q);
                        const fetchedThreads = querySnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                        }));
                        setThreads(fetchedThreads);

                        // Calculate totals and percentages
                        const chatThreads = fetchedThreads.filter(thread => thread.type === 'chat');
                        const codeReviewThreads = fetchedThreads.filter(thread => thread.type === 'codeReview');
                        setTotalChats(chatThreads.length);
                        setTotalCodeReviews(codeReviewThreads.length);
                        setTotalResponses(chatThreads.length + codeReviewThreads.length);

                        const total = fetchedThreads.length;
                        setChatCodeReviewPercentage({
                            chat: Math.round((chatThreads.length / total) * 100),
                            codeReview: Math.round((codeReviewThreads.length / total) * 100),
                        });

                        // Prepare activity data for chart
                        const activityByDate = fetchedThreads.reduce((acc, thread) => {
                            const date = thread.createdAt.toDate().toISOString().split('T')[0];
                            if (!acc[date]) acc[date] = { date, chats: 0, codeReviews: 0 };
                            if (thread.type === 'chat') acc[date].chats++;
                            else if (thread.type === 'codeReview') acc[date].codeReviews++;
                            return acc;
                        }, {});
                        setActivityData(Object.values(activityByDate).sort((a, b) => new Date(a.date) - new Date(b.date)));

                        // Prepare skill distribution data
                        // const skillCounts = fetchedThreads.reduce((acc, thread) => {
                        //     if (thread.skills) {
                        //         thread.skills.forEach(skill => {
                        //             if (!acc[skill]) acc[skill] = 0;
                        //             acc[skill]++;
                        //         });
                        //     }
                        //     return acc;
                        // }, {});
                        // Dummy skill count data
                        const skillCounts = {
                            JavaScript: 10,
                            React: 8,
                            Nodejs: 7,
                            MongoDB: 5,
                            Expressjs: 6,
                        };
                        setSkillDistributionData(Object.entries(skillCounts).map(([skill, count]) => ({ skill, count })));
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const filterThreads = () => {
            const filteredThreads = threads.filter(thread => {
                const matchesSearch = thread.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesDate = dateFilter === 'all' ||
                    (dateFilter === 'last_week' && isWithinLastWeek(thread.createdAt)) ||
                    (dateFilter === 'last_month' && isWithinLastMonth(thread.createdAt));
                return matchesSearch && matchesDate;
            });
            setFilteredChatThreads(filteredThreads.filter(thread => thread.type === 'chat'));
            setFilteredCodeReviewThreads(filteredThreads.filter(thread => thread.type === 'codeReview'));
        };

        filterThreads();
    }, [threads, searchTerm, dateFilter]);

    const isWithinLastWeek = (createdAt) => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return createdAt.toDate() > oneWeekAgo;
    };

    const isWithinLastMonth = (createdAt) => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return createdAt.toDate() > oneMonthAgo;
    };

    const handleThreadClick = (threadId, type) => {
        router.push(`/${type}/${threadId}`);
    };

    const handleEditProfile = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedUserData(userData);
    };

    const handleSaveProfile = async () => {
        try {
            await updateDoc(doc(db, "users", auth.currentUser.uid), editedUserData);
            setUserData(editedUserData);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile: ", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUserData(prev => ({ ...prev, [name]: value }));
    };

    if (!userData) {
        return <div>Loading...</div>;
    }

    // const toggleSidebar = () => {
    //     setIsSidebarOpen(!isSidebarOpen);
    // };

    const handleSidebarToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:w-64 w-full bg-white p-5 flex flex-col items-center"
            >
                <img
                    src={userData.photoURL || "https://avatars.githubusercontent.com/u/105903006?v=4"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mb-4"
                />
                {isEditing ? (
                    <div className="w-full">
                        <input
                            type="text"
                            name="name"
                            value={editedUserData.name}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-2 border rounded"
                        />
                        <input
                            type="text"
                            name="title"
                            value={editedUserData.title}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-2 border rounded"
                        />
                        <div className="flex justify-between">
                            <button onClick={handleSaveProfile} className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
                            <button onClick={handleCancelEdit} className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold mb-2">{userData.name}</h2>
                        <p className="text-gray-600 mb-4">{userData.title}</p>
                        <button onClick={handleEditProfile} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
                            Edit Profile
                        </button>
                    </>
                )}
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 p-4 lg:p-10">
                {/* Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
                >
                    <div className="p-4 bg-white rounded shadow">
                        <h3 className="text-sm text-gray-500">Total chats</h3>
                        <p className="text-2xl font-semibold">{totalChats}</p>
                    </div>
                    <div className="p-4 bg-white rounded shadow">
                        <h3 className="text-sm text-gray-500">Code Reviews</h3>
                        <p className="text-2xl font-semibold">{totalCodeReviews}</p>
                    </div>
                    <div className="p-4 bg-white rounded shadow">
                        <h3 className="text-sm text-gray-500">Total responses</h3>
                        <p className="text-2xl font-semibold">{totalResponses || 0}</p>
                    </div>
                    <div className="p-4 bg-white rounded shadow">
                        <span className="flex">
                            <h3 className="text-sm text-gray-500">Chat vs</h3>
                            <span className="text-sm text-gray-500 hidden lg:block">Code</span>
                            <h3 className="text-sm text-gray-500">&nbsp;Review</h3>
                        </span>
                        <p className="text-xl md:text-2xl font-semibold">{chatCodeReviewPercentage.chat}% / {chatCodeReviewPercentage.codeReview}%</p>
                        <span className="text-gray-500 hidden lg:block ">Chat / Code Review</span>
                    </div>
                </motion.div>

                {/* Charts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                >
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-lg font-semibold mb-4">Activity Over Time</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="chats" stroke="#8884d8" />
                                <Line type="monotone" dataKey="codeReviews" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-lg font-semibold mb-4">Skill Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={skillDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="skill" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Chat and Code Review History */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ">
                    {/* Chat History Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="p-6 bg-white rounded shadow"
                        style={{ height: '600px', overflowY: 'auto' }} 
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Chat History</h3>
                        </div>
                        {/* Search bar and filter */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                placeholder="Search chat history..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="p-2 border border-gray-300 rounded"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="last_week">Last Week</option>
                                <option value="last_month">Last Month</option>
                            </select>
                        </div>

                        <AnimatePresence>
                            {filteredChatThreads.map((thread) => (
                                <motion.div
                                    key={thread.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex justify-between p-4 bg-gray-100 rounded-lg shadow mb-2 cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleThreadClick(thread.id, 'chat')}
                                >
                                    <span>{thread.name}</span>
                                    <span className="font-semibold">{thread.createdAt.toDate().toLocaleDateString()}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Code Review History Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="p-6 bg-white rounded shadow"
                        style={{ height: '600px', overflowY: 'auto' }} //
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Code Review History</h3>
                        </div>
                        {/* Search bar and filter */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                placeholder="Search code review history..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="p-2 border border-gray-300 rounded"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="last_week">Last Week</option>
                                <option value="last_month">Last Month</option>
                            </select>
                        </div>

                        <AnimatePresence>
                            {filteredCodeReviewThreads.map((thread) => (
                                <motion.div
                                    key={thread.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex justify-between p-4 bg-gray-100 rounded-lg shadow mb-2 cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleThreadClick(thread.id, 'codeReview')}
                                >
                                    <span>{thread.name}</span>
                                    <span className="font-semibold">{thread.createdAt.toDate().toLocaleDateString()}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}