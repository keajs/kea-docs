import '../resetKea'
import React, { useState } from 'react'
import classnames from 'classnames'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'
import './styles.css'
import { getContext } from 'kea'
import { Provider } from 'react-redux'

const features = [
    {
        title: 'Strong Foundations',
        image: (
            <svg
                className={classnames(styles.featureImage, 'feature-foundations')}
                enableBackground="new 0 0 100 100"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g fill="#1d1d1b">
                    <path d="m34.2803955 73.2192993c-.034668-16.2867432-.8716431-36.8203125-1.0545044-41.1202393 1.2255859-.8283691 2.0328979-2.2305908 2.0328979-3.8178101v-4.5415039c0-.8286133-.6713867-1.5-1.5-1.5h-16.234375c-.8286133 0-1.5.6713867-1.5 1.5v4.541504c0 1.5870361.8071289 2.9891968 2.0324097 3.8175659-.1828003 4.2993774-1.0193481 24.8334961-1.0540161 41.1204834-1.4108276.760437-2.3826904 2.2341919-2.3826904 3.946228v6.8969727c0 .8286133.6713867 1.5 1.5 1.5h19.0429688c.8286133 0 1.5-.6713867 1.5-1.5v-6.8969727c-.0000001-1.7120361-.9718629-3.185791-2.3826905-3.946228zm-4.0241089-40.3330688c.2236938 5.3532715.9732056 24.3568115 1.0230713 39.7792969h-11.2755127c.0498657-15.4214478.7989502-34.4258423 1.022583-39.7792969zm-11.2318725-7.6464844h13.234375v3.0415039c0 .8847656-.7202148 1.6049805-1.6054688 1.6049805h-10.0239258c-.8847656 0-1.6049805-.7202148-1.6049805-1.6049805v-3.0415039zm14.6386718 57.3227539h-16.0429687v-5.3969727c0-.6853027.4645996-1.2583618 1.0934448-1.4369507.0667725-.0095825.1312866-.0235596.1948853-.041626.0697632-.0100098.1391602-.0214233.2116699-.0214233h13.0429688c.0725098 0 .1419067.0114136.2116699.0214233.0635986.0180664.1281128.0320435.1948853.041626.6288452.1785889 1.0934448.7516479 1.0934448 1.4369507v5.3969727z" />
                    <path d="m59.7803955 73.2192993c-.034668-16.2867432-.8716431-36.8203125-1.0545044-41.1202393 1.2255859-.8283691 2.0328979-2.2305908 2.0328979-3.8178101v-4.5415039c0-.8286133-.6713867-1.5-1.5-1.5h-16.234375c-.8286133 0-1.5.6713867-1.5 1.5v4.541504c0 1.5870361.8071289 2.9891968 2.0324097 3.8175659-.1828003 4.2993774-1.0193481 24.8334961-1.0540161 41.1204834-1.4108276.760437-2.3826904 2.2341919-2.3826904 3.946228v6.8969727c0 .8286133.6713867 1.5 1.5 1.5h19.0429688c.8286133 0 1.5-.6713867 1.5-1.5v-6.8969727c-.0000001-1.7120361-.9718629-3.185791-2.3826905-3.946228zm-4.0241089-40.3330688c.2236938 5.3532715.9732056 24.3568115 1.0230713 39.7792969h-11.2755127c.0498657-15.4214478.7989502-34.4258423 1.022583-39.7792969zm-11.2318725-7.6464844h13.234375v3.0415039c0 .8847656-.7202148 1.6049805-1.6054688 1.6049805h-10.0239258c-.8847656 0-1.6049805-.7202148-1.6049805-1.6049805v-3.0415039zm14.6386718 57.3227539h-16.0429687v-5.3969727c0-.6853027.4645996-1.2583618 1.0934448-1.4369507.0667725-.0095825.1312866-.0235596.1948853-.041626.0697632-.0100098.1391602-.0214233.2116699-.0214233h13.0429688c.0725098 0 .1419067.0114136.2116699.0214233.0635986.0180664.1281128.0320435.1948853.041626.6288452.1785889 1.0934448.7516479 1.0934448 1.4369507v5.3969727z" />
                    <path d="m85.2803955 73.2192993c-.034668-16.2867432-.8716431-36.8203125-1.0545044-41.1202393 1.2255859-.8283691 2.0328979-2.2305908 2.0328979-3.8178101v-4.5415039c0-.8286133-.6713867-1.5-1.5-1.5h-16.234375c-.8286133 0-1.5.6713867-1.5 1.5v4.541504c0 1.5870361.8071289 2.9891968 2.0324097 3.8175659-.1828003 4.2993774-1.0193481 24.8334961-1.0540161 41.1204834-1.4108276.760437-2.3826904 2.2341919-2.3826904 3.946228v6.8969727c0 .8286133.6713867 1.5 1.5 1.5h19.0429688c.8286133 0 1.5-.6713867 1.5-1.5v-6.8969727c-.0000001-1.7120361-.9718629-3.185791-2.3826905-3.946228zm-4.0241089-40.3330688c.2236938 5.3532715.9732056 24.3568115 1.0230713 39.7792969h-11.2755127c.0498657-15.4214478.7989502-34.4258423 1.022583-39.7792969zm-11.2318725-7.6464844h13.234375v3.0415039c0 .8847656-.7202148 1.6049805-1.6054688 1.6049805h-10.0239258c-.8847656 0-1.6049805-.7202148-1.6049805-1.6049805v-3.0415039zm14.6386718 57.3227539h-16.0429687v-5.3969727c0-.6853027.4645996-1.2583618 1.0934448-1.4369507.0667725-.0095825.1312866-.0235596.1948853-.041626.0697632-.0100098.1391602-.0214233.2116699-.0214233h13.0429688c.0725098 0 .1419067.0114136.2116699.0214233.0635986.0180664.1281128.0320435.1948853.041626.6288452.1785889 1.0934448.7516479 1.0934448 1.4369507v5.3969727z" />
                </g>
            </svg>
        ),
        description: (
            <>
                <p>
                    Kea is a <strong>complete ecosystem</strong> built on top of Redux that just{' '}
                    <strong>makes sense</strong>.
                </p>
                <p>
                    It comes <em>batteries included</em> and does more than most competing solutions.
                </p>
            </>
        ),
    },
    {
        title: 'Scalable & Composable',
        image: (
            <svg
                className={classnames(styles.featureImage, 'feature-interconnected')}
                enableBackground="new 0 0 100 100"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="m32.2155762 58.4046021c-.9265747-.5863037-2.0206909-.9309692-3.1960449-.9309692-3.3085938 0-6 2.6914062-6 6s2.6914062 6 6 6c1.8092041 0 3.4300537-.8082275 4.5310059-2.0786133.7213135-.8322754 1.2143555-1.8633423 1.390686-3 .0467529-.3011475.0783081-.6072998.0783081-.9213867 0-.9967041-.2478638-1.9352417-.6796265-2.7631836-.4923706-.9442139-1.2283325-1.7388917-2.1243286-2.3058472zm-6.196045 5.0690307c0-1.6542969 1.3457031-3 3-3 .6205444 0 1.1976318.1893311 1.6765747.5133057.7979126.5396729 1.3234253 1.4529419 1.3234253 2.4866943 0 1.6542969-1.3457031 3-3 3-.3167725 0-.616272-.0627441-.9031372-.1541748-1.2112426-.3859253-2.0968628-1.5083008-2.0968628-2.8458252z" />
                <path d="m70.9492188 49.9672852c-2.5714722 0-5.0215454.5276489-7.2501221 1.4776611l-3.2993774-5.6073608c4.9177856-3.3397827 8.1559448-8.9760742 8.1559448-15.3556519 0-10.2290039-8.3222656-18.5507812-18.5507812-18.5507812s-18.5507812 8.3217773-18.5507812 18.5507812c0 6.3795776 3.2381592 12.0158691 8.1559448 15.3556519l-3.3084717 5.6227417c-2.2373047-.9588013-4.697998-1.493042-7.2820435-1.493042-10.2285156 0-18.5507812 8.3217773-18.5507812 18.5507812s8.3222656 18.5507812 18.5507812 18.5507812 18.5507812-8.3217773 18.5507812-18.5507812c0-.3790894-.0343628-.7495117-.0568848-1.1230469h4.9418945c-.022522.3735352-.0568848.7439575-.0568848 1.1230469 0 10.2290039 8.3222656 18.5507812 18.5507812 18.5507812s18.5507814-8.3217773 18.5507814-18.5507812-8.3222656-18.5507812-18.5507812-18.5507812zm0 34.1015625c-3.9332275 0-7.519165-1.4794312-10.2605591-3.895813.7284546-2.1461182 2.5241699-3.9280396 4.8045044-4.5690308 3.2128906-.9023438 7.7011719-.9023438 10.9121094 0 2.2803345.6409912 4.0760498 2.4229126 4.8045044 4.5690308-2.7413941 2.4163818-6.3273316 3.895813-10.2605591 3.895813zm6.2685546-11.3525391c-3.7480469-1.0537109-8.7851562-1.0546875-12.5371094 0-2.7042847.7599487-4.9338379 2.6577759-6.2039185 5.050293-1.9245605-2.588501-3.0783081-5.7824097-3.0783081-9.2485352 0-.3790894.0300903-.7506714.0568848-1.1230469.0742798-1.0314941.2490234-2.0334473.5155029-3 1.0299683-3.7357178 3.4135132-6.9080811 6.5975952-8.9555664.8399658-.5401001 1.7335815-1.0003662 2.6732788-1.3728638 1.7694702-.701416 3.6912842-1.0993042 5.7075195-1.0993042 8.5751955.0000001 15.5507814 6.9760743 15.5507814 15.5507813 0 3.4661255-1.1537476 6.6600342-3.0783081 9.2485352-1.2700806-2.3925171-3.4996338-4.2903443-6.2039185-5.050293zm-27.2128906-57.7851563c8.5751953 0 15.5507812 6.9760742 15.5507812 15.5507812 0 3.4660645-1.1536865 6.6598511-3.078125 9.248291-1.2700806-2.3925781-3.4996948-4.2905884-6.2041016-5.0505371-.8621216-.2424927-1.7973633-.4224854-2.7645874-.5533447-2.2712402-.307312-4.736084-.3069458-7.0083008.0006104-.9668579.1308594-1.9019165.3106689-2.7642212.5527344-2.7044067.7599487-4.934021 2.657959-6.2041016 5.0505371-1.9244385-2.5884399-3.078125-5.7822266-3.078125-9.248291.0000002-8.574707 6.9755861-15.5507813 15.5507814-15.5507813zm-5.5491333 22.6710206c.0320435-.0095215.0608521-.0257568.0930786-.03479 1.1339111-.3184814 2.4294434-.5184326 3.7685547-.6120605 1.1162109-.078125 2.2587891-.078125 3.375 0 1.3391724.0936279 2.6346436.2935791 3.7685547.6120605.0322266.0090332.0610352.0252686.0930786.03479 2.2348633.6635132 3.9934692 2.4187012 4.7115479 4.534668-.4447021.3919678-.9066162.7634888-1.394104 1.1033325-.8185425.5706177-1.6933594 1.0636597-2.6158447 1.47052-1.914978.8446045-4.0267944 1.3220215-6.2507324 1.3220215s-4.3357544-.477417-6.2507324-1.3220215c-.9224854-.4068604-1.7973022-.8999023-2.6158447-1.47052-.4874878-.3398438-.9494019-.7113647-1.394104-1.1033325.7180785-2.1159669 2.4766844-3.8711549 4.7115477-4.534668zm.114563 30.9158935c0 3.4661865-1.1538086 6.6601562-3.0783691 9.2486572-1.2700806-2.3922729-3.4996338-4.2901611-6.2038574-5.050415-3.7490234-1.0537109-8.7861328-1.0546875-12.5371094 0-2.7040405.7598877-4.9338379 2.6575928-6.2042847 5.0498047-1.9243164-2.5884399-3.0779419-5.7821655-3.0779419-9.2480469 0-8.574707 6.9755859-15.5507812 15.5507812-15.5507812 2.0288696 0 3.9627075.4019165 5.741272 1.1116943.9386597.3745728 1.8311157.836853 2.6697388 1.3788452 3.1692505 2.0481567 5.5405884 5.2130737 6.5673828 8.9371948.2664795.9665527.4412231 1.9685059.5155029 3 .0267945.3723755.0568848.7439576.0568848 1.1230469zm-15.5507813 15.5507813c-3.9335938 0-7.5197754-1.4796753-10.2612915-3.8964844.7286377-2.145874 2.524353-3.9274292 4.8052368-4.5683594 3.2128906-.9033203 7.7011719-.9023438 10.9121094 0 2.2803345.6413574 4.0760498 2.4230957 4.8045044 4.5690918-2.741394 2.4163818-6.3273315 3.895752-10.2605591 3.895752zm18.0729371-19.6738282c-1.1013794-4.8271484-4.0862427-8.9349365-8.1426392-11.5193481l3.2797852-5.5739746c2.3686523 1.0996094 4.9967041 1.7310181 7.7752686 1.7310181s5.4067383-.6314087 7.7753296-1.7310181l3.2688599 5.555603c-4.0715942 2.583252-7.0687256 6.6987305-8.1727905 11.5377197z" />
                <path d="m70.9492188 57.4736328c-1.1627197 0-2.2455444.3378296-3.1658325.9125977-.897583.5606079-1.6383057 1.3477173-2.1360474 2.2858887-.4440308.8370361-.6981201 1.7897339-.6981201 2.8015137 0 .3140869.0315552.6202393.0783081.9213867.1763306 1.1366577.6693726 2.1677246 1.390686 3 1.1009521 1.2703857 2.7218018 2.0786133 4.5310059 2.0786133 3.3085938 0 6-2.6914062 6-6s-2.6914063-6.0000001-6-6.0000001zm.9501342 8.8312378c-.300293.1011963-.6161499.1687622-.9501343.1687622-1.6542969 0-3-1.3457031-3-3 0-1.0463867.5401001-1.9666748 1.3544312-2.5036621.4730835-.3120117 1.0376587-.4963379 1.6455688-.4963379 1.6542969 0 3 1.3457031 3 3 .0000001 1.3203125-.8627319 2.4313355-2.0498657 2.8312378z" />
                <path d="m48.2396851 31.1712036c.5584106.1722412 1.151001.2658081 1.7651978.2658081s1.2067871-.0935669 1.7651978-.2658081c2.4495239-.7554932 4.2348022-3.0397949 4.2348022-5.7341919 0-3.3085938-2.6914062-6-6-6s-6 2.6914062-6 6c-.0000001 2.694397 1.7852782 4.9786987 4.2348022 5.7341919zm1.7651977-8.7341919c1.6542969 0 3 1.3457031 3 3s-1.3457031 3-3 3-3-1.3457031-3-3 1.3457031-3 3-3z" />
            </svg>
        ),
        description: (
            <>
                <p>
                    Kea is built for <strong>productive teams</strong> that work on <strong>ambitious</strong> projects.
                    It scales really well.
                </p>
                <p>
                    It's a set of <em>interconnected building blocks</em> that just get out of your way.
                </p>
            </>
        ),
    },
    {
        title: 'Sparks Joy!',
        image: (
            <svg
                style={{ cursor: 'pointer' }}
                className={classnames(styles.featureImage, 'feature-sparks-joy')}
                enableBackground="new 0 0 100 100"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="m50 15.738c18.922 0 34.262 15.34 34.262 34.262s-15.34 34.262-34.262 34.262-34.262-15.34-34.262-34.262 15.34-34.262 34.262-34.262m0-5c-21.649 0-39.262 17.613-39.262 39.262s17.613 39.262 39.262 39.262 39.262-17.613 39.262-39.262-17.613-39.262-39.262-39.262z" />
                <path
                    d="m35.064 63.806s14.519 15.354 29.873 0"
                    fill="none"
                    stroke="#000"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    strokeWidth="6"
                />
                <path d="m42.126 44.831s-.095-.027-.272-.077c-.164-.06-.433-.127-.72-.254-.292-.131-.667-.258-1.037-.39-.358-.135-.761-.287-1.202-.452-.415-.18-.868-.308-1.295-.473-.226-.054-.432-.134-.648-.201-.221-.047-.423-.106-.629-.164-.21-.033-.406-.074-.598-.122-.195-.006-.382-.056-.562-.063-.361-.042-.699-.039-1.042-.04-.345.024-.699.027-1.086.097-.386.061-.802.124-1.234.242-.866.206-1.792.528-2.659.815-.86.3-1.666.574-2.266.768-.283.109-.551.171-.713.232-.176.054-.27.082-.27.082s-.013-.103-.009-.285c.01-.178.003-.458.062-.777.086-.661.313-1.57.821-2.56.515-.98 1.299-2.066 2.513-2.962.594-.455 1.31-.85 2.102-1.15.791-.305 1.691-.461 2.594-.499.909-.011 1.828.121 2.659.403.835.278 1.572.686 2.2 1.146.297.246.599.469.853.728.242.266.483.51.693.773.39.535.733 1.046.957 1.558.242.497.418.985.535 1.433.137.44.181.83.208 1.146.043.311.033.588.046.763-.001.185-.001.283-.001.283z" />
                <path d="m74.107 44.831s-.095-.027-.272-.077c-.164-.06-.433-.127-.72-.254-.292-.131-.667-.258-1.037-.39-.358-.135-.761-.287-1.202-.452-.415-.18-.868-.308-1.295-.473-.226-.054-.432-.134-.648-.201-.221-.047-.423-.106-.629-.164-.21-.033-.406-.074-.598-.122-.195-.006-.382-.056-.562-.063-.361-.042-.699-.039-1.042-.04-.345.024-.699.027-1.086.097-.386.061-.802.124-1.234.242-.866.206-1.792.528-2.659.815-.86.3-1.666.574-2.266.768-.283.109-.551.171-.713.232-.176.054-.27.082-.27.082s-.013-.103-.009-.285c.01-.178.003-.458.062-.777.086-.661.313-1.57.822-2.56.515-.98 1.299-2.066 2.513-2.962.594-.455 1.31-.85 2.102-1.15.791-.305 1.691-.461 2.594-.499.909-.011 1.828.121 2.659.403.835.278 1.572.686 2.2 1.146.297.246.599.469.853.728.242.266.483.51.693.773.39.535.733 1.046.957 1.558.242.497.418.985.535 1.433.137.44.181.83.207 1.146.043.311.033.588.046.763-.001.185-.001.283-.001.283z" />
            </svg>
        ),
        description: (
            <>
                <p>
                    Kea strikes a <strong>beautiful balance</strong> between developer <strong>productivity</strong> and{' '}
                    <strong>happiness</strong>.
                </p>
                <p>
                    Words like <em>joy</em>, <em>amazing</em>, <em>simple</em> and <em>intuitive</em> have been used to
                    describe the experience.
                </p>
            </>
        ),
    },
]

const QUOTES = [
    {
        thumbnail: 'img/testimonials/tim.jpg',
        name: 'Tim Glaser',
        title: 'CTO at PostHog',
        text: (
            <>
                I wasn't sure whether we should have an abstraction layer on top of Redux, but after using Kea for a day
                I never looked back. Kea feels like the <strong>good kind of magic</strong>. You can{' '}
                <strong>understand what’s happening</strong>, but it takes away a lot of the tedious tasks. Adding more
                features doesn't feel like adding more complexity.
            </>
        ),
    },
    {
        thumbnail: 'img/testimonials/michael.jpg',
        name: 'Michael Fatoki-Bello',
        title: 'User Experience Engineer',
        text: (
            <>
                Setting up Kea is so simple and intuitive. The best bit has to be how Kea{' '}
                <strong>handles form management</strong>, something that used to be a horrible experience for most
                frontenders, has been made <strong>so straightforward and almost trivial</strong> to achieve. Such a
                sane and sensible way to manage state.
            </>
        ),
    },
    {
        thumbnail: 'img/testimonials/scotty.jpg',
        name: 'Scotty Bollinger',
        title: 'Senior Front End Engineer at Elastic',
        text: (
            <>
                We have 3-5 engineers working on the Kea codebase. <strong>We use TypeScript</strong> and have about 25
                logic stores all connected via a parent app logic store. Absolutely LOVE the library and, as a engineer
                new to Redux, I found this to be <strong>incredibly easy to get up to speed on</strong> and it seems to
                scale very well.
            </>
        ),
    },
]

function Feature({ image, imageUrl, title, description }) {
    const imgUrl = useBaseUrl(imageUrl)
    return (
        <div className={classnames('col col--4 text--center', styles.feature)}>
            {image ? (
                <div className="text--center">{image}</div>
            ) : (
                imgUrl && (
                    <div className="text--center">
                        <img className={styles.featureImage} src={imgUrl} alt={title} />
                    </div>
                )
            )}
            <h2 className="text--center">{title}</h2>
            {description}
        </div>
    )
}

function Home() {
    const context = useDocusaurusContext()
    const [showExample, setShowExample] = useState(true)

    const { siteConfig = {} } = context
    return (
        <Layout
            title="Production Ready React State Management"
            description="Kea is a production-grade state management framework built for ambitious React apps."
        >
            <header className={classnames('hero hero--primary', styles.heroBanner)}>
                <div className="container">
                    <h1 className="hero__title" style={{ textAlign: 'center' }}>
                        {siteConfig.title}
                    </h1>
                    <p className="hero__subtitle">{siteConfig.tagline}</p>

                    <div className={styles.buttons}>
                        <Link
                            className={classnames(
                                'button button--outline button--secondary button--lg',
                                styles.getStarted
                            )}
                            to={useBaseUrl('docs/introduction/what-is-kea')}
                        >
                            Read the docs to get started
                        </Link>
                    </div>
                </div>
            </header>
            <section className="homepage-logos">
                <div className="container">
                    <span className="trusted">Trusted by:</span>
                    <div className="trusted-logos">
                        <a target="_blank" rel="noopener noreferrer" href="https://www.navirec.com">
                            <img className="navirec" src={useBaseUrl('img/trusted/navirec.svg')} />
                        </a>
                        <a target="_blank" rel="noopener noreferrer" href="https://www.posthog.com">
                            <img
                                className="posthog"
                                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjMwIiB2aWV3Qm94PSIwIDAgMTUwIDMwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMCAxOC4yNTg1TDcuMzEzMjIgMjUuNTYxOUgwVjE4LjI1ODVaTTAgMTYuNDMyNkw5LjE0MTUzIDI1LjU2MTlIMTYuNDU0N0wwIDkuMTI5MjVWMTYuNDMyNlpNMCA3LjMwMzRMMTguMjgzIDI1LjU2MTlIMjUuNTk2M0wwIDBWNy4zMDM0Wk05LjE0MTUzIDcuMzAzNEwyNy40MjQ2IDI1LjU2MTlWMTguMjU4NUw5LjE0MTUzIDBWNy4zMDM0Wk0xOC4yODMgMFY3LjMwMzRMMjcuNDI0NiAxNi40MzI2VjkuMTI5MjVMMTguMjgzIDBaIiBmaWxsPSIjRjlCRDJCIi8+CjxwYXRoIGQ9Ik00My44NzkzIDIyLjY0MDZDNDIuMDA1NyAyMi42NDA2IDQwLjIwOTUgMjEuODk3MSAzOC44ODU4IDIwLjU3NTJMMjguNzE3NSAxMC40MjA1VjI1LjU2MTlINDMuODc5M1YyMi42NDA2WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTMzLjEwNTUgMjIuNjQwNUMzMy45MTMzIDIyLjY0MDUgMzQuNTY4MSAyMS45ODY2IDM0LjU2ODEgMjEuMTc5OUMzNC41NjgxIDIwLjM3MzIgMzMuOTEzMyAxOS43MTkyIDMzLjEwNTUgMTkuNzE5MkMzMi4yOTc3IDE5LjcxOTIgMzEuNjQyOSAyMC4zNzMyIDMxLjY0MjkgMjEuMTc5OUMzMS42NDI5IDIxLjk4NjYgMzIuMjk3NyAyMi42NDA1IDMzLjEwNTUgMjIuNjQwNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0wIDI1LjU2MTlINy4zMTMyMkwwIDE4LjI1ODVWMjUuNTYxOVoiIGZpbGw9IiMxRDRBRkYiLz4KPHBhdGggZD0iTTkuMTQxNTMgOS4xMjkyNUwwIDBWNy4zMDM0TDkuMTQxNTMgMTYuNDMyNlY5LjEyOTI1WiIgZmlsbD0iIzFENEFGRiIvPgo8cGF0aCBkPSJNMCA5LjEyOTI2VjE2LjQzMjdMOS4xNDE1MyAyNS41NjE5VjE4LjI1ODVMMCA5LjEyOTI2WiIgZmlsbD0iIzFENEFGRiIvPgo8cGF0aCBkPSJNMTguMjgzIDkuMTI5MjVMOS4xNDE1MyAwVjcuMzAzNEwxOC4yODMgMTYuNDMyNlY5LjEyOTI1WiIgZmlsbD0iI0Y1NEUwMCIvPgo8cGF0aCBkPSJNOS4xNDE1MyAyNS41NjE5SDE2LjQ1NDdMOS4xNDE1MyAxOC4yNTg1VjI1LjU2MTlaIiBmaWxsPSIjRjU0RTAwIi8+CjxwYXRoIGQ9Ik05LjE0MTUzIDkuMTI5MjZWMTYuNDMyN0wxOC4yODMgMjUuNTYxOVYxOC4yNTg1TDkuMTQxNTMgOS4xMjkyNloiIGZpbGw9IiNGNTRFMDAiLz4KPHBhdGggZD0iTTczLjQ4OTEgMTUuNDUxMUM3My40ODkxIDE4LjcyMyA3Mi4wMjM1IDIwLjkxODQgNjcuMDc1NCAyMC45MTg0SDY0LjM0OVYyNS41NjE5SDYxLjM3MTFWMTAuMDA1N0g2Ny4wNzU0QzcyLjAyMzUgMTAuMDA3MSA3My40ODkxIDEyLjE3OTIgNzMuNDg5MSAxNS40NTExWk03MC41MTExIDE1LjQ1MTFDNzAuNTExMSAxMy41NTIyIDY5LjkxNTggMTIuNzUxNyA2Ny42MDE5IDEyLjc1MTdINjQuMzQ5VjE4LjE3MzhINjcuNjAxOUM2OS45MTU4IDE4LjE3MzggNzAuNTExMSAxNy4yODEzIDcwLjUxMTEgMTUuNDUxMVoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik03NC45NzggMTkuNjYwOEM3NC45NzggMTYuMDY4OSA3Ni45NzAyIDEzLjU1MjIgODAuNjgyNCAxMy41NTIyQzg0LjM5MzEgMTMuNTUyMiA4Ni4zODY3IDE2LjA2ODkgODYuMzg2NyAxOS42NjA4Qzg2LjM4NjcgMjMuMjUyNiA4NC4zOTMxIDI1Ljc5MTIgODAuNjgyNCAyNS43OTEyQzc2Ljk3MTYgMjUuNzkxMiA3NC45NzggMjMuMjUxMSA3NC45NzggMTkuNjYwOFpNODMuNDA4NyAxOS42NjA4QzgzLjQwODcgMTcuMTQ0IDgyLjY5OTQgMTYuMjk4MyA4MC42ODI0IDE2LjI5ODNDNzguNjY2OCAxNi4yOTgzIDc3Ljk1NiAxNy4xNDQgNzcuOTU2IDE5LjY2MDhDNzcuOTU2IDIyLjE3NzUgNzguNjY1NCAyMy4wNDY2IDgwLjY4MjQgMjMuMDQ2NkM4Mi42OTc5IDIzLjA0NTIgODMuNDA4NyAyMi4xNzYxIDgzLjQwODcgMTkuNjYwOFoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik04OC4zMzM0IDIxLjMzMDNDOTAuNDE3NyAyMi42MzQ3IDkxLjk1MzUgMjMuMDQ2NiA5My42NDg3IDIzLjA0NjZDOTQuNzQ4NiAyMy4wNDY2IDk1LjIwNjQgMjIuNjExMyA5NS4yMDY0IDIyLjA0MDJDOTUuMjA2NCAyMS4zNzcxIDk0Ljc5MzkgMjEuMDU3MiA5Mi45NjEyIDIwLjc1OTJDODkuMzY0NiAyMC4yMSA4OC4zMzM0IDE4Ljc5MTcgODguMzMzNCAxNi45ODQ4Qzg4LjMzMzQgMTQuNjI4NyA5MC4zMDM2IDEzLjU1MzYgOTIuNzU1IDEzLjU1MzZDOTQuMjg5MyAxMy41NTM2IDk2LjE0NTQgMTMuOTY1NiA5Ny4yNjczIDE0Ljc0MjZWMTcuNDg3M0M5NS41OTU1IDE2LjY2MzQgOTMuNzg2MiAxNi4yOTgzIDkyLjUyNTQgMTYuMjk4M0M5MS43MDA0IDE2LjI5ODMgOTEuMzExNCAxNi41OTYyIDkxLjMxMTQgMTcuMTIyMUM5MS4zMTE0IDE3LjY5NDcgOTEuNjA5NyAxOC4wMTQ2IDkzLjQ0MjQgMTguNDAzMUM5Ni44NzgyIDE5LjExMTUgOTguMTg0NCAxOS44NDQ4IDk4LjE4NDQgMjIuMTA4OUM5OC4xODQ0IDI0LjQ0MTYgOTYuMTAwMSAyNS43OTEyIDkzLjQxOTEgMjUuNzkxMkM5MS42MzE3IDI1Ljc5MTIgOTAuMDA1MiAyNS40NDggODguMzMzNCAyNC4zMjc2VjIxLjMzMDNWMjEuMzMwM1oiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0xMDQuMTM5IDE2LjUyNjFWMjIuODE3M0gxMDcuMjc2VjI1LjU2MTlIMTAxLjE2MVYxNi41MjYxSDk5LjMyODFWMTMuNzgxNUgxMDEuMTYxVjkuNTQ5OTRIMTA0LjEzOVYxMy43ODE1SDEwNy4yNzZWMTYuNTI2MUgxMDQuMTM5WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTEyMy4wNiAxMC4wMDcxVjI1LjU2MzRIMTIwLjA4MlYxOS4zODYySDExMy4yMzJWMjUuNTYzNEgxMTAuMjU0VjEwLjAwNzFIMTEzLjIzMlYxNi42NDE1SDEyMC4wODJWMTAuMDA3MUgxMjMuMDZWMTAuMDA3MVoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0xMjUuMzUyIDE5LjY2MDhDMTI1LjM1MiAxNi4wNjg5IDEyNy4zNDQgMTMuNTUyMiAxMzEuMDU2IDEzLjU1MjJDMTM0Ljc2NyAxMy41NTIyIDEzNi43NiAxNi4wNjg5IDEzNi43NiAxOS42NjA4QzEzNi43NiAyMy4yNTI2IDEzNC43NjcgMjUuNzkxMiAxMzEuMDU2IDI1Ljc5MTJDMTI3LjM0NSAyNS43OTEyIDEyNS4zNTIgMjMuMjUxMSAxMjUuMzUyIDE5LjY2MDhaTTEzMy43ODEgMTkuNjYwOEMxMzMuNzgxIDE3LjE0NCAxMzMuMDcxIDE2LjI5ODMgMTMxLjA1NCAxNi4yOTgzQzEyOS4wMzkgMTYuMjk4MyAxMjguMzI4IDE3LjE0NCAxMjguMzI4IDE5LjY2MDhDMTI4LjMyOCAyMi4xNzc1IDEyOS4wMzcgMjMuMDQ2NiAxMzEuMDU0IDIzLjA0NjZDMTMzLjA3MSAyMy4wNDUyIDEzMy43ODEgMjIuMTc2MSAxMzMuNzgxIDE5LjY2MDhaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMTUwIDEzLjc4MTVWMjkuMjIyNEgxNDAuNjA4VjI2LjQ3NzdIMTQ3LjAyMlYyMy4yNzQ1QzE0Ni4zMzUgMjQuMDI5NiAxNDUuMzI3IDI0LjY0NzUgMTQzLjY3NyAyNC42NDc1QzE0MC4yNDEgMjQuNjQ3NSAxMzguNTkxIDIyLjA2MjEgMTM4LjU5MSAxOS4wODgyQzEzOC41OTEgMTYuMTM3NiAxNDAuMjQxIDEzLjU1MjIgMTQzLjY3NyAxMy41NTIyQzE0NS4zMjcgMTMuNTUyMiAxNDYuMzM1IDE0LjE3MDEgMTQ3LjAyMiAxNS4wMzkyVjEzLjc4MTVIMTUwVjEzLjc4MTVaTTE0Ny4wMjIgMTkuMDg4MkMxNDcuMDIyIDE3LjMyNjYgMTQ2LjMxMyAxNi4yOTY4IDE0NC4yOTYgMTYuMjk2OEMxNDIuMjggMTYuMjk2OCAxNDEuNTY5IDE3LjMyNjYgMTQxLjU2OSAxOS4wODgyQzE0MS41NjkgMjAuODczMSAxNDIuMjggMjEuOTAxNCAxNDQuMjk2IDIxLjkwMTRDMTQ2LjMxMSAyMS45MDE0IDE0Ny4wMjIgMjAuOTg3MSAxNDcuMDIyIDE5LjA4ODJaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K"
                            />
                        </a>
                        <a target="_blank" rel="noopener noreferrer" href="https://www.elastic.co">
                            <img className="elastic" src={useBaseUrl('img/trusted/elastic.svg')} />
                        </a>
                        <a target="_blank" rel="noopener noreferrer" href="https://www.gsmtasks.com">
                            <img className="gsmtasks" src={useBaseUrl('img/trusted/gsmtasks.svg')} />
                        </a>
                        <a target="_blank" rel="noopener noreferrer" href="https://giveawayking.ng/">
                            <svg
                                className="giveawayking"
                                height="30"
                                viewBox="0 0 427.09 239.15"
                                preserveAspectRatio="xMidYMid meet"
                            >
                                <title>Giveaway King</title>
                                <path d="M39.59 56c12.82 0 20.26 5.06 20.26 11.79 0 5.77-7.44 7.75-7.91 7.2a14.32 14.32 0 00-11.4-5.46c-7.28 0-13 5.53-13 13.92S32.68 97.3 39.8 97.3c5.54 0 9.26-2.54 10.05-6.73h-5.3c-5 0-7.44-1.19-7.44-5.46v-.71c0-4.51 2.45-5.46 7.44-5.46H58.5c4.59.06 5.5 2.16 5.5 6.75v21.44c0 .47-2.45 1.58-5.3 1.58-3.16 0-6.57-1.27-7.83-6-2.77 4-7.76 6.48-14.88 6.48-14.79 0-24.36-11.15-24.36-26.5C11.59 67.17 22.74 56 39.59 56zM71.08 64.09c0-4.91 2.29-7.36 6.65-7.36H80c4.51 0 6.88 2.45 6.88 7.36v37.26c0 4.83-2.37 7.36-6.88 7.36h-2.27c-4.36 0-6.65-2.53-6.65-7.36zM91.57 62.19c-.63-1.5 4.59-5.46 9.81-5.46 4 0 7.36 2.85 8.78 7.36l8 25.47 7.91-25.47c1.51-5.14 5-7.36 8.47-7.36 5.14 0 10.05 4 9.41 5.46l-16.85 40.58c-1.82 4.28-4.43 5.94-9.18 5.94s-7.12-1.51-9-5.94zM148.06 65.91c0-5.7 2.85-8.78 8.07-8.78h27.21c5.07 0 7.36 2.53 7.36 6.64v.4c0 4.35-2.29 6.64-7.36 6.64h-19.46V76h13c5.22 0 7.35 2.21 7.35 6.09v.23c0 4.12-2.21 6.49-7.35 6.49h-13v5.94h19.86c5 0 7.28 2.13 7.28 6.25v.39c0 4.35-2.3 7-7.28 7h-27.61c-5.22 0-8.07-2.92-8.07-8.7zM210.24 61.08c.79-2.53 2.93-4.35 10-4.35s9 1.82 9.81 4.35L247.34 104c.56 1.43-3.71 5.06-8.46 5.06-3.32 0-6.88-1.82-9.1-7.51l-1.42-3.8h-16.54l-1.42 4c-1.9 5.46-5.22 7.35-8.62 7.35-4.36 0-8.71-3.48-8.15-4.9zm15.27 25.24L220 71.45l-5.46 14.87zM244.42 62.27c-.16-.71 3.16-5.38 9.89-5.38 3.16 0 7.43 1.74 8.7 8.46l4.27 22.08 5.38-20c.87-3.95 4.43-5.77 8.7-5.77 4 0 7.6 2.13 8.47 5.77l5.38 20 4.27-22.31c1.11-6.17 4.9-8.23 8.62-8.23 6.33 0 9.5 4.59 9.26 5.38l-11.63 40.43c-1.19 4.5-4.43 6.09-9.34 6.09-4.74 0-7.91-1.43-9.33-6.09l-6-21.13-5.94 21.13c-1.26 4.58-4.67 6.09-9.41 6.09-4.91 0-7.91-1.35-9.18-6.09zM332 61.08c.79-2.53 2.92-4.35 10-4.35s9 1.82 9.81 4.35L369.1 104c.55 1.43-3.72 5.06-8.47 5.06-3.32 0-6.88-1.82-9.09-7.51l-1.43-3.8h-16.53l-1.43 4c-1.9 5.46-5.22 7.35-8.62 7.35-4.35 0-8.7-3.48-8.15-4.9zm15.26 25.24l-5.53-14.87-5.46 14.87zM382.07 88.3l-17.8-25.48c-.47-.79 2.3-5.93 10.37-5.93 2.69 0 5.3 1.58 7.43 5.46l7.84 13.53 8.22-13.53c2.38-4 4.91-5.54 7.52-5.54 7.28 0 10.28 5.3 9.81 6L397.9 88.3v13c0 4.83-2.38 7.36-6.89 7.36h-2.29c-4.35 0-6.65-2.53-6.65-7.36zM13.67 133c0-10.79 5-16.18 14.62-16.18h5.05c9.92 0 15.14 5.39 15.14 16.18v33.41l27.14-37.76c6.09-8.88 12.88-11.83 19.14-11.83 11.83 0 20.88 11 19.84 13L83.1 173l33.07 45.24c1.21 2.09-8.36 12.88-21.06 12.88-6.61 0-13.22-3-19.14-11.66l-27.49-38.12v33.59c0 10.61-5.22 16.18-15.14 16.18h-5.05c-9.57 0-14.62-5.57-14.62-16.18zM128.34 133c0-10.79 5-16.18 14.62-16.18h5c9.92 0 15.14 5.39 15.14 16.18v82c0 10.61-5.22 16.18-15.14 16.18h-5c-9.57 0-14.62-5.57-14.62-16.18zM180.37 133c0-10.79 5.39-16.18 14.27-16.18h3.3c8.18 0 10.79 2.43 15.66 8.17l40.4 52.53V133c0-10.62 5.22-16.18 15.14-16.18h3c9.57 0 14.62 5.56 14.62 16.18v82c0 10.79-5.4 16.18-14.1 16.18h-2.78c-8.36 0-10.79-2.09-15.49-7.66L213.08 170v44.9c0 10.61-5.22 16.18-15.14 16.18h-3c-9.57 0-14.61-5.57-14.61-16.18zM361.33 115.22c28.19 0 44.55 11.14 44.55 25.93 0 12.7-16.36 17-17.41 15.83a31.41 31.41 0 00-25.05-12c-16 0-28.54 12.18-28.54 30.62s11.31 30.45 27 30.45c12.18 0 20.36-5.57 22.1-14.79h-11.69c-11 0-16.36-2.61-16.36-12v-1.57c0-9.92 5.4-12 16.36-12h30.63c10.09 0 12.18 4.7 12 14.79v47.16c0 1-5.39 3.48-11.65 3.48-7 0-14.45-2.78-17.23-13.22-6.09 8.7-17.05 14.26-32.71 14.26-32.54 0-53.6-24.53-53.6-58.29 0-34.11 24.54-58.65 61.6-58.65zM11.6 14.18l5.53 32.29a.56.56 0 00.56.47h40.82a.58.58 0 00.56-.47L65 13.34a.33.33 0 00-.56-.29L50.27 29.72a.32.32 0 01-.52 0L38.53 7.16a.33.33 0 00-.59 0L27.85 29.72c-.09.21-.38.17-.54 0l-14.74-16a.56.56 0 00-.97.46z"></path>
                            </svg>
                        </a>
                        <a target="_blank" rel="noopener noreferrer" href="https://www.apprentus.com">
                            <img className="apprentus" src={useBaseUrl('img/trusted/apprentus.png')} />
                        </a>
                    </div>
                </div>
            </section>
            <main>
                <section className={styles.features}>
                    <div className="container">
                        <div className="row">
                            {features.map((props, idx) => (
                                <Feature key={idx} {...props} />
                            ))}
                        </div>
                    </div>
                </section>

                <div className="homepage-testimonials">
                    <div className="container">
                        <div className="row">
                            {QUOTES.map((quote) => (
                                <div className="col" key={quote.name}>
                                    <div className="avatar avatar--vertical margin-bottom--sm">
                                        <img
                                            alt={quote.name}
                                            className="avatar__photo avatar__photo--xl"
                                            src={useBaseUrl(quote.thumbnail)}
                                            style={{ overflow: 'hidden' }}
                                        />
                                        <div className="avatar__intro padding-top--sm">
                                            <h4 className="avatar__name">{quote.name}</h4>
                                            <small className="avatar__subtitle">{quote.title}</small>
                                        </div>
                                    </div>
                                    <p className="text--center text--italic padding-horiz--md">{quote.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="homepage-cta">
                    <div className="container">
                        <div className="row">
                            <div className="col text--center" style={{ fontSize: 24 }}>
                                Read the documentation: <Link to="/docs/introduction/what-is-kea">What is Kea?</Link>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col text--center" style={{ fontSize: 16, marginTop: 18 }}>
                                Want to see a full app written with Kea? Check out{' '}
                                <a href="https://github.com/PostHog/posthog">PostHog</a>. It's open-source product
                                analytics and we're building it now!
                            </div>
                        </div>
                        <div className="row">
                            <div className="col text--center" style={{ fontSize: 16, marginTop: 18 }}>
                                Looking for docs for <a href="https://v1.keajs.org/">Kea 1.0</a>{' '}
                                or <a href="https://v0.keajs.org/">0.28</a>?
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    )
}

export default function WrappedHome() {
    return (
        <Provider store={getContext().store}>
            <Home />
        </Provider>
    )
}
