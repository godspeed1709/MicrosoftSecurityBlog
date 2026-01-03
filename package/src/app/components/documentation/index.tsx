'use client'

import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// @ts-ignore
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { urlFor } from '@/lib/imageUrl'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function DocumentationPage({ doc }: { doc: any }) {
    const searchParams = useSearchParams();
    const [activeId, setActiveId] = useState<string | null>(null)
    const isPortable = Array.isArray(doc?.content)
    const portableContent = isPortable ? doc.content : []
    const markdownContent = !isPortable && typeof doc?.content === 'string' ? doc.content : ''

    const slugify = (text: string) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')

    const markdownHeadings = markdownContent
        .split('\n')
        .map((line: string) => {
            const h5 = line.match(/^#####\s+(.+)/)
            if (h5) return { level: 'h5', text: h5[1] }
            const h4 = line.match(/^####\s+(.+)/)
            if (h4) return { level: 'h4', text: h4[1] }
            return null
        })
        .filter(Boolean)
        .map((h: any) => ({ ...h, id: slugify(h.text) }))


    const headings = isPortable
        ? portableContent
            .filter((block: any) => block._type === 'block' && ['h5', 'h4'].includes(block.style))
            .map((block: any) => ({
                text: block.children.map((c: any) => c.text).join(''),
                id: block._key,
                level: block.style,
            }))
        : markdownHeadings
        
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            setActiveId(hash);
        };
        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [searchParams]);

    const markdownComponents = {
        h4: ({ children }: any) => {
            const text = String(children?.[0] ?? '')
            const id = slugify(text)
            return (
                <h4 id={id} className="pt-4 scroll-mt-24 text-xl font-semibold mt-6">
                    {children}
                </h4>
            )
        },
        h5: ({ children }: any) => {
            const text = String(children?.[0] ?? '')
            const id = slugify(text)
            return (
                <h5 id={id} className="pt-4 scroll-mt-24 text-xl font-semibold mt-6">
                    {children}
                </h5>
            )
        },
        p: ({ children }: any) => <p className="mt-4 whitespace-pre-wrap">{children}</p>,
        blockquote: ({ children }: any) => {
            return <blockquote className="border-l-4 border-smokyBlack/20 dark:border-white/20 pl-4 my-4 italic text-secondary dark:text-white/80">{children}</blockquote>
        },
        ul: ({ children }: any) => <ul className="list-disc pl-5 space-y-2 text-smokyBlack dark:text-white">{children}</ul>,
        ol: ({ children }: any) => <ol className="list-decimal pl-5 space-y-2 text-smokyBlack dark:text-white">{children}</ol>,
        li: ({ children }: any) => <li>{children}</li>,
        img: ({ src, alt }: any) => {
            if (!src) return null
            return (
                <Image
                    src={src}
                    alt={alt || ''}
                    width={960}
                    height={540}
                    className="my-6 rounded-lg border border-smokyBlack/10 dark:border-white/10 object-contain w-full h-auto"
                />
            )
        },
        code({ inline, className, children }: any) {
            const match = /language-(\w+)/.exec(className || '')
            if (!inline && match) {
                return (
                    <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            lineHeight: '1.6',
                            margin: '1rem 0',
                            padding: '1rem',
                        }}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                )
            }
            return <code className={className}>{children}</code>
        },
    }


    const components = {
        types: {
            cardGrid: ({ value }: any) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-6 my-6 border-b border-smokyBlack/10">
                    {value.cards.map((card: any, index: number) => (
                        <div
                            key={index}
                            className="border border-smokyBlack/10 dark:border-white/10 rounded-xl p-5"
                        >
                            {card.icon?.asset && (
                                <Image
                                    src={urlFor(card.icon)}
                                    alt={card.title}
                                    width={40}
                                    height={40}
                                    className="mb-4"
                                />
                            )}
                            <p className="text-smokyBlack font-bold">{card.title}</p>
                            <p className="text-gray-600 text-sm">{card.description}</p>
                        </div>
                    ))}
                </div>
            ),
            code: ({ value }: any) => (
                <div className="my-6">
                    {value?.filename && (
                        <div className="bg-[#282C34] text-sm px-4 py-3.5 rounded-t-md font-mono text-white border border-b-0 border-gray-300">
                            {value.filename}
                        </div>
                    )}
                    <SyntaxHighlighter
                        language={value.language || 'javascript'}
                        style={oneDark}
                        customStyle={{
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            lineHeight: '1.6',
                            margin: 0,
                            padding: '1rem',
                        }}
                    >
                        {value.code}
                    </SyntaxHighlighter>
                </div>
            ),
        },

        block: ({ children, value }: any) => {
            const style = value.style || 'normal'
            const id = value._key
            if (['h4', 'h5'].includes(style)) {
                const Tag = style
                return (
                    <Tag
                        id={id}
                        className={`pt-4 scroll-mt-24 ${style === 'h2' ? 'text-2xl font-bold mt-10' : 'text-xl font-semibold mt-6'}`}
                    >
                        {children}
                    </Tag>
                )
            }
            return <p className="mt-4">{children}</p>
        },

        list: {
            bullet: ({ children }: any) => (
                <ul className="list-disc pl-5 space-y-2 text-smokyBlack dark:text-white">{children}</ul>
            ),
            number: ({ children }: any) => (
                <ol className="list-decimal pl-5 space-y-2 text-smokyBlack dark:text-white">{children}</ol>
            ),
        },

        listItem: {
            bullet: ({ children }: any) => <li>{children}</li>,
            number: ({ children }: any) => <li>{children}</li>,
        },
    }

    return (
        <div className="container">
            <div className="flex items-start py-11 sm:py-20">
                <div className="flex-grow min-w-0">
                    <div className="docs-content max-w-3xl">
                        <h1 className="text-3xl md:text-4xl text-smokyBlack dark:text-white mb-6">{doc.title}</h1>
                        {isPortable ? (
                            <PortableText value={portableContent} components={components} />
                        ) : (
                            <div className="docs-markdown text-secondary dark:text-white/90">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                    {markdownContent}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 py-6 mt-6 border-t border-smokyBlack/10 dark:border-white/10">
                        <p className="text-smokyBlack dark:text-white font-semibold">
                            What did you think of this content?
                        </p>
                        <div className="flex flex-wrap gap-y-2 gap-x-5">
                            {[
                                { icon: 'like-icon', label: 'It was helpful' },
                                { icon: 'dislike-icon', label: 'It was not helpful' },
                                { icon: 'feedback-icon', label: 'I have a feedback' },
                            ].map(({ icon, label }) => (
                                <div className="flex items-center gap-2" key={icon}>
                                    <Image src={`/images/doc-intro/${icon}.svg`} alt={icon} width={20} height={20} />
                                    <p>{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {headings.length > 0 && (
                    <aside className="w-[240px] flex-shrink-0 sticky top-10 h-fit hidden lg:block text-sm pl-10">
                        <p className="uppercase font-semibold mb-4 text-sm text-secondary dark:text-white/80">
                            On this page
                        </p>
                        <ul className="border-l border-smokyBlack/10 dark:border-white/10">
                            {headings.map(({ id, text }: any) => {
                                return (
                                    <li key={id} className={`py-1 px-3 ${activeId === id && "border-l border-smokyBlack"}`}>
                                        <Link
                                            href={`#${id}`}
                                            className={`block transition-colors text-sm font-normal ${activeId === id
                                                ? 'text-black dark:text-white font-semibold'
                                                : 'text-secondary dark:text-white/60'
                                                }`}
                                        >
                                            {text}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </aside>
                )}
            </div>
        </div>
    )
}
