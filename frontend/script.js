const { useState, useRef, useEffect } = React;

const AppContext = React.createContext();

const useStore = () => {
    const [analysisResult, setAnalysisResult] = useState(null);
    return { analysisResult, setAnalysisResult };
};

const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cloud-arrow-up-fill mr-2" viewBox="0 0 16 16"><path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2z"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download mr-2" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16"><path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16"><path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/></svg>;

function ResumeAnalyzer() {
    const { setAnalysisResult: setGlobalAnalysisResult } = React.useContext(AppContext);
    const [resume, setResume] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);
    
    useEffect(() => {
        if (analysisResult) {
            setGlobalAnalysisResult(analysisResult);
        }
    }, [analysisResult, setGlobalAnalysisResult]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }
        setFileName(file.name);
        setIsLoading(true);
        setLoadingMessage('Parsing PDF...');
        setError('');
        setResume('');
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
                }
                setResume(fullText);
            } catch (parseError) {
                setError('Failed to parse the PDF.');
                setFileName('');
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleAnalyze = async () => {
        if (!resume || !jobDescription) {
            setError('Please upload a resume and provide the job description.');
            return;
        }
        setIsLoading(true);
        setLoadingMessage('The AI is analyzing your resume...');
        setError('');
        setAnalysisResult(null);
        
        const backendUrl = 'http://localhost:3001/api/analyze';

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume, jobDescription })
            });
            if (!response.ok) throw new Error('Network response was not ok.');
            const result = await response.json();
            const candidate = result.candidates?.[0];
            if (candidate && candidate.content?.parts?.[0]?.text) {
                const parsedResult = JSON.parse(candidate.content.parts[0].text);
                setAnalysisResult(parsedResult);
            } else {
                throw new Error('Invalid response structure from the AI model.');
            }
        } catch (err) {
            setError(`Failed to analyze. Make sure your local server is running.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Find Your ATS Score</h2>
            <p className="text-slate-400 mb-6">Upload your resume PDF and paste a job description to get an instant ATS compatibility score.</p>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center">
                    <input type="file" accept=".pdf" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                    <button onClick={() => fileInputRef.current.click()} disabled={isLoading} className="flex items-center justify-center w-full md:w-1/2 px-6 py-3 mb-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 transition-all disabled:bg-slate-500 disabled:cursor-not-allowed">
                        <UploadIcon />
                        {isLoading && fileName ? 'Parsing PDF...' : 'Upload Resume (PDF)'}
                    </button>
                    {fileName && !isLoading && (
                        <div className="flex justify-between items-center w-full md:w-1/2 p-2 bg-green-500/10 text-green-300 rounded-md border border-green-500/30 text-sm">
                            <span className="truncate">{fileName}</span>
                            <button onClick={() => { setFileName(''); setResume(''); if (fileInputRef.current) fileInputRef.current.value = null; }} className="text-red-400 hover:text-red-300 font-bold ml-2 text-lg">&times;</button>
                        </div>
                    )}
                </div>
                <textarea className="w-full h-72 p-4 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-700 text-slate-200 placeholder-slate-400" placeholder="Paste the full job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
            </div>
            <div className="mt-6 text-center">
                <button onClick={handleAnalyze} disabled={isLoading} className="w-full md:w-auto px-12 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 transition-all duration-300 ease-in-out disabled:bg-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? 'Analyzing...' : 'Analyze My Resume'}
                </button>
            </div>
            {error && <div className="mt-6 p-4 bg-red-500/10 text-red-300 border border-red-500/30 rounded-lg">{error}</div>}
            {isLoading && (
                <div className="mt-8 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="ml-4 text-slate-300">{loadingMessage}</p>
                </div>
            )}
            {analysisResult && (
                <div className="mt-8 p-6 bg-slate-900 rounded-lg shadow-inner animate-fade-in border border-slate-700">
                    <h3 className="text-2xl font-bold text-slate-100 mb-4">Analysis Result</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col items-center justify-center bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700">
                            <div className="relative h-32 w-32">
                                <svg className="w-full h-full" viewBox="0 0 36 36"><path className="text-slate-700" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path><path className="text-blue-500 transition-all duration-1000 ease-in-out" strokeWidth="3" strokeDasharray={`${analysisResult.score}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path></svg>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-blue-400">{analysisResult.score}%</div>
                            </div>
                            <p className="mt-2 text-lg font-semibold text-slate-300">Compatibility Score</p>
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="text-xl font-semibold text-slate-200 mb-2">Actionable Feedback</h4>
                            <p className="text-slate-400 mb-4 leading-relaxed">{analysisResult.feedback}</p>
                            <h4 className="text-xl font-semibold text-slate-200 mb-3">Missing Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                                {analysisResult.missingKeywords.map((keyword, index) => (
                                    <span key={index} className="bg-blue-500/10 text-blue-300 text-sm font-medium px-3 py-1 rounded-full">{keyword}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ResumeBuilder() {
    const resumePreviewRef = useRef(null);
    const [fontFamily, setFontFamily] = useState('serif');
    const [fontSize, setFontSize] = useState('11pt');
    const [resumeData, setResumeData] = useState({
        fullName: 'Your Name', email: 'your.email@example.com', phone: '123-456-7890', linkedin: 'linkedin.com/in/yourprofile',
        summary: 'A brief professional summary about yourself.',
        experiences: [{ id: 1, title: 'Job Title', company: 'Company Name', period: 'Jan 2022 - Present', description: 'Your responsibilities and achievements.' }],
        educations: [{ id: 1, degree: 'Degree', institution: 'Institution Name', period: '2018 - 2022' }],
        skills: 'Skill 1, Skill 2, Skill 3',
    });

    const handleChange = (e) => setResumeData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleDynamicChange = (section, index, e) => {
        const list = [...resumeData[section]];
        list[index][e.target.name] = e.target.value;
        setResumeData(prev => ({ ...prev, [section]: list }));
    };
    const addSectionItem = (section) => {
        const newItem = section === 'experiences' ? { id: Date.now(), title: '', company: '', period: '', description: '' } : { id: Date.now(), degree: '', institution: '', period: '' };
        setResumeData(prev => ({...prev, [section]: [...prev[section], newItem]}));
    };
    const removeSectionItem = (section, index) => {
        const list = [...resumeData[section]];
        list.splice(index, 1);
        setResumeData(prev => ({...prev, [section]: list}));
    };

    const handleDownloadPdf = () => {
        const element = resumePreviewRef.current;
        const opt = { margin: 0.5, filename: `${resumeData.fullName}_Resume.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas:  { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }};
        html2pdf().from(element).set(opt).save();
    };

    return (
         <div className="p-4 md:p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100">Resume Builder</h2>
                    <p className="text-slate-400">Fill in your details to generate a professional resume.</p>
                </div>
                <button onClick={handleDownloadPdf} className="flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 transition-all transform hover:scale-105">
                    <DownloadIcon />
                    Download PDF
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6 lg:h-[70vh] lg:overflow-y-auto pr-4 -mr-4 custom-scrollbar">
                    <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <h3 className="font-bold text-xl mb-3 text-slate-200">Styling</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="font-family" className="block text-sm font-medium text-slate-300 mb-1">Font Family</label>
                                <select id="font-family" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full p-2 border border-slate-500 rounded bg-slate-800 text-white focus:ring-blue-500 focus:border-blue-500">
                                    <option value="serif">Serif (Times New Roman)</option>
                                    <option value="sans-serif">Sans-Serif (Arial)</option>
                                    <option value="'Courier New', monospace">Monospace (Courier)</option>
                                    <option value="'Georgia', serif">Georgia</option>
                                    <option value="'Verdana', sans-serif">Verdana</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="font-size" className="block text-sm font-medium text-slate-300 mb-1">Font Size</label>
                                <select id="font-size" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full p-2 border border-slate-500 rounded bg-slate-800 text-white focus:ring-blue-500 focus:border-blue-500">
                                    <option value="10pt">Small</option>
                                    <option value="11pt">Normal</option>
                                    <option value="12pt">Large</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <h3 className="font-bold text-xl mb-3 text-slate-200">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="fullName" value={resumeData.fullName} onChange={handleChange} placeholder="Full Name" className="p-2 border border-slate-500 rounded bg-slate-800 text-white" />
                            <input type="email" name="email" value={resumeData.email} onChange={handleChange} placeholder="Email" className="p-2 border border-slate-500 rounded bg-slate-800 text-white" />
                            <input type="tel" name="phone" value={resumeData.phone} onChange={handleChange} placeholder="Phone" className="p-2 border border-slate-500 rounded bg-slate-800 text-white" />
                            <input type="text" name="linkedin" value={resumeData.linkedin} onChange={handleChange} placeholder="LinkedIn Profile URL" className="p-2 border border-slate-500 rounded bg-slate-800 text-white" />
                        </div>
                    </div>
                    <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <h3 className="font-bold text-xl mb-3 text-slate-200">Professional Summary</h3>
                        <textarea name="summary" value={resumeData.summary} onChange={handleChange} placeholder="Professional Summary" className="w-full h-24 p-2 border border-slate-500 rounded bg-slate-800 text-white"></textarea>
                    </div>
                    <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-xl text-slate-200">Work Experience</h3><button onClick={() => addSectionItem('experiences')} className="flex items-center text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"><PlusIcon/></button></div>
                        {resumeData.experiences.map((exp, index) => (
                            <div key={exp.id} className="grid grid-cols-1 gap-2 mb-4 p-3 bg-slate-800 border border-slate-600 rounded-md relative">
                                <button onClick={() => removeSectionItem('experiences', index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300"><TrashIcon/></button>
                                <input type="text" name="title" value={exp.title} onChange={(e) => handleDynamicChange('experiences', index, e)} placeholder="Job Title" className="p-2 border border-slate-500 rounded bg-slate-900 text-white" />
                                <input type="text" name="company" value={exp.company} onChange={(e) => handleDynamicChange('experiences', index, e)} placeholder="Company" className="p-2 border border-slate-500 rounded bg-slate-900 text-white" />
                                <input type="text" name="period" value={exp.period} onChange={(e) => handleDynamicChange('experiences', index, e)} placeholder="Period (e.g., Jan 2022 - Present)" className="p-2 border border-slate-500 rounded bg-slate-900 text-white" />
                                <textarea name="description" value={exp.description} onChange={(e) => handleDynamicChange('experiences', index, e)} placeholder="Job Description" className="w-full h-20 p-2 border border-slate-500 rounded bg-slate-900 text-white"></textarea>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-xl text-slate-200">Education</h3><button onClick={() => addSectionItem('educations')} className="flex items-center text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"><PlusIcon/></button></div>
                        {resumeData.educations.map((edu, index) => (
                            <div key={edu.id} className="grid grid-cols-1 gap-2 mb-4 p-3 bg-slate-800 border border-slate-600 rounded-md relative">
                                <button onClick={() => removeSectionItem('educations', index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300"><TrashIcon/></button>
                                <input type="text" name="degree" value={edu.degree} onChange={(e) => handleDynamicChange('educations', index, e)} placeholder="Degree" className="p-2 border border-slate-500 rounded bg-slate-900 text-white" />
                                <input type="text" name="institution" value={edu.institution} onChange={(e) => handleDynamicChange('educations', index, e)} placeholder="Institution" className="p-2 border border-slate-500 rounded bg-slate-900 text-white" />
                                <input type="text" name="period" value={edu.period} onChange={(e) => handleDynamicChange('educations', index, e)} placeholder="Period (e.g., 2018 - 2022)" className="p-2 border border-slate-500 rounded bg-slate-900 text-white" />
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <h3 className="font-bold text-xl mb-3 text-slate-200">Skills</h3>
                        <textarea name="skills" value={resumeData.skills} onChange={handleChange} placeholder="Comma-separated skills" className="w-full h-24 p-2 border border-slate-500 rounded bg-slate-800 text-white"></textarea>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-2xl border border-slate-200" id="resume-preview" ref={resumePreviewRef} style={{ fontFamily: fontFamily, fontSize: fontSize }}>
                   <div className="text-center border-b-2 pb-4 border-slate-200"><h1 className="text-4xl font-bold text-slate-800" style={{ fontFamily: fontFamily }}>{resumeData.fullName}</h1><p className="text-sm text-slate-500 mt-2">{resumeData.email} | {resumeData.phone} | {resumeData.linkedin}</p></div>
                    <div className="mt-6"><h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-2" style={{ fontFamily: fontFamily }}>Summary</h2><p className="text-slate-700 leading-relaxed">{resumeData.summary}</p></div>
                    <div className="mt-6"><h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-2" style={{ fontFamily: fontFamily }}>Experience</h2>{resumeData.experiences.map(exp => (<div key={exp.id} className="mb-4"><h3 className="text-lg font-semibold text-slate-800" style={{ fontFamily: fontFamily }}>{exp.title}</h3><div className="flex justify-between text-sm text-slate-600"><p className="font-medium">{exp.company}</p><p>{exp.period}</p></div><p className="text-slate-700 mt-1 leading-relaxed">{exp.description}</p></div>))}</div>
                    <div className="mt-6"><h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-2" style={{ fontFamily: fontFamily }}>Education</h2>{resumeData.educations.map(edu => (<div key={edu.id} className="mb-2"><div className="flex justify-between items-start text-sm"><div><h3 className="text-lg font-semibold text-slate-800" style={{ fontFamily: fontFamily }}>{edu.degree}</h3><p className="text-slate-600">{edu.institution}</p></div><p className="text-slate-500 text-right">{edu.period}</p></div></div>))}</div>
                    <div className="mt-6"><h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-2" style={{ fontFamily: fontFamily }}>Skills</h2><p className="text-slate-700">{resumeData.skills}</p></div>
                </div>
            </div>
        </div>
    );
}

function ResumeChatbot() {
    const { analysisResult } = React.useContext(AppContext);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (analysisResult) {
            setMessages([{ sender: 'ai', text: `Hello! I have your resume analysis results. I'm ready to help you improve your score of ${analysisResult.score}%. What would you like to work on first?` }]);
        } else {
            setMessages([{ sender: 'ai', text: "Hello! Please go to the 'Find Your ATS Score' tab and analyze your resume first. I'll be ready to help you here after." }]);
        }
    }, [analysisResult]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newMessages = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        const backendUrl = 'http://localhost:3001/api/chat';

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userQuery: userInput, analysisResult })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            const result = await response.json();
            const aiResponse = result.candidates[0].content.parts[0].text;
            setMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
        } catch (error) {
            setMessages([...newMessages, { sender: 'ai', text: "I'm having a little trouble connecting right now. Please try again in a moment." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold text-slate-100 mb-2">AI Career Coach</h2>
            <p className="text-slate-400 mb-6">Ask for detailed advice on improving your resume score.</p>
            <div className="flex flex-col h-[70vh]">
                <div ref={chatContainerRef} className="flex-grow bg-slate-900 rounded-t-lg p-4 overflow-y-auto custom-scrollbar">
                   {messages.map((msg, index) => (
                       <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`prose-output rounded-lg px-4 py-2 max-w-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                               {msg.sender === 'ai' ? <div dangerouslySetInnerHTML={{ __html: msg.text }} /> : msg.text}
                           </div>
                       </div>
                   ))}
                   {isLoading && (
                       <div className="flex justify-start">
                            <div className="bg-slate-700 text-slate-200 rounded-lg px-4 py-2">
                                <span className="animate-pulse">...</span>
                            </div>
                       </div>
                   )}
                </div>
                <form onSubmit={handleSendMessage} className="flex items-center bg-slate-700 rounded-b-lg p-2 border-t border-slate-600">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={analysisResult ? "Ask how to improve your resume..." : "Please analyze your resume first."}
                        className="w-full p-2 border border-slate-500 rounded-l-md bg-slate-800 text-white focus:ring-blue-500 focus:border-blue-500"
                        disabled={!analysisResult || isLoading}
                    />
                    <button type="submit" disabled={!analysisResult || isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-r-md hover:bg-blue-700 disabled:bg-slate-500">
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
}

function App() {
    const store = useStore();
    const [page, setPage] = useState('analyzer');

    const NavButton = ({ target, children }) => (
        <button onClick={() => setPage(target)} className={`w-full px-4 py-2 text-lg font-medium rounded-md transition-colors duration-300 ${page === target ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
            {children}
        </button>
    );

    const renderPage = () => {
        switch(page) {
            case 'analyzer': return <ResumeAnalyzer />;
            case 'builder': return <ResumeBuilder />;
            case 'chatbot': return <ResumeChatbot />;
            default: return <ResumeAnalyzer />;
        }
    }

    return (
        <AppContext.Provider value={store}>
            <div className="min-h-screen font-sans text-slate-100">
                <div className="container mx-auto p-4 md:p-8">
                    <header className="text-center mb-10">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">AI Resume Suite</h1>
                        <p className="mt-2 text-xl text-slate-400">Craft the perfect resume and land your dream job.</p>
                    </header>
                    <nav className="flex justify-center mb-8 bg-slate-800 p-2 rounded-xl shadow-lg w-full sm:w-auto sm:max-w-lg mx-auto border border-slate-700">
                        <NavButton target="analyzer">Find Your ATS Score</NavButton>
                        <NavButton target="builder">Resume Builder</NavButton>
                        <NavButton target="chatbot">AI Career Coach</NavButton>
                    </nav>
                    <main>{renderPage()}</main>
                    <footer className="text-center mt-12 text-slate-500"><p>&copy; 2025 AI Resume Suite. A Fusion of Design & Technology.</p></footer>
                </div>
            </div>
        </AppContext.Provider>
    );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);