/**
 * tenant-bootstrap.js
 * Handles multi-tenant content fetching and block rendering for the Wiser dynamic website.
 */

$(document).ready(function () {
    // 1. Configuration & URL Parsing
    const serverUrl = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) 
        ? "http://localhost:3000" 
        : "https://backend-suman.onrender.com";
    const urlParams = new URLSearchParams(window.location.search);
    const colid = urlParams.get('colid') || "30"; // Default to 30 for testing
    const slug = urlParams.get('slug') || "home";

    console.log(`Bootstrapping for colid: ${colid}, slug: ${slug}`);

    // 2. Fetch Global Settings (Nav/Footer/Branding)
    $.ajax({
        url: `${serverUrl}/api/v2/cms/settings?colid=${colid}`,
        method: "GET",
        success: function (res) {
            if (res.success && res.data) {
                window.cmsSettings = res.data; // Store globally for render access
                applyGlobalSettings(res.data);
            }
        }
    });

    // 3. Fetch Page Content (Blocks)
    $.ajax({
        url: `${serverUrl}/api/v2/cms/pages/byslug?colid=${colid}&slug=${slug}`,
        method: "GET",
        success: function (res) {
            if (res.success && res.data) {
                const settings = window.cmsSettings; // We will store it globally for now
                renderPageContent(res.data, settings);
            } else {
                $("#cms-content").html('<div class="container text-center py-5"><h2>404 - Page Not Found</h2><p>The page you are looking for does not exist.</p></div>');
            }
        },
        error: function() {
            $("#cms-content").html('<div class="container text-center py-5"><h2>Error</h2><p>Failed to load page content.</p></div>');
        }
    });

    /**
     * Applies branding, navbar, and footer settings
     */
    function applyGlobalSettings(settings) {
        // --- Branding ---
        if (settings.branding) {
            document.title = settings.branding.site_name || "Campus Website";
            if (settings.branding.logo_url) {
                let logoSrc = settings.branding.logo_url;
                if (!logoSrc.startsWith('http') && !logoSrc.startsWith('//') && !logoSrc.startsWith('data:')) {
                    logoSrc = `${serverUrl}/${logoSrc}`;
                }
                const $logo = $(".logo img");
                $logo.on('error', function() {
                    $(this).attr("src", "img/logo.png");
                });
                $logo.attr("src", logoSrc);
                $logo.css({ "max-height": "80px", "width": "auto", "display": "block" });
            }
            $(":root").css("--primary-color", settings.branding.primary_color || "#2563eb");
            $(":root").css("--secondary-color", settings.branding.secondary_color || "#f59e0b");

            const dynamicStyles = `
                .header-top_area { background: #000 !important; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .boxed-btn3 { background: ${settings.branding.primary_color} !important; border-color: ${settings.branding.primary_color} !important; }
                .boxed-btn3:hover { background: transparent !important; color: ${settings.branding.primary_color} !important; border-color: ${settings.branding.primary_color} !important; }
                .main-header-area .main-menu ul li a:hover,
                .main-header-area .main-menu ul li a.active { color: ${settings.branding.primary_color} !important; }
                .main-header-area .main-menu ul li a:hover::before,
                .main-header-area .main-menu ul li a.active::before { background: ${settings.branding.primary_color} !important; }
                .footer .footer_top { background: #1a1c27; }
                .footer .footer_title::after { background: ${settings.branding.secondary_color} !important; }
                
                /* Sidebar Content Styles */
                .sidebar-widget { border: 1px solid #eee; margin-bottom: 30px; }
                .sidebar-widget-header { background: #002147; color: #fff; padding: 15px 20px; font-weight: 600; font-size: 18px; }
                .sidebar-widget-list { list-style: none; padding: 0; margin: 0; }
                .sidebar-widget-list li { border-bottom: 1px solid #eee; }
                .sidebar-widget-list li a { display: block; padding: 12px 20px; color: #444; font-size: 15px; background: #f9f9f9; transition: all 0.3s; }
                .sidebar-widget-list li a:hover { background: #002147; color: #fff; padding-left: 25px; }
                .sidebar-content-area h1, .sidebar-content-area h2 { color: #002147; margin-bottom: 20px; border-bottom: 2px solid #f59e0b; display: inline-block; padding-bottom: 5px; }

                /* Hero Quick Action Buttons */
                .hero-quick-actions { position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); display: flex; gap: 30px; z-index: 10; width: 100%; justify-content: center; }
                .q-action { display: flex; flex-direction: column; align-items: center; text-decoration: none !important; transition: transform 0.3s; }
                .q-action:hover { transform: translateY(-10px); }
                .q-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 30px; margin-bottom: 10px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
                .q-label { color: white; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }

                /* News Date Stamp Design */
                .news-item { display: flex; gap: 20px; margin-bottom: 30px; align-items: flex-start; }
                .date-stamp { background: #002147; color: white; min-width: 80px; height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 5px; }
                .date-stamp span { display: block; line-height: 1; }
                .date-day { font-size: 24px; font-weight: 800; }
                .date-mon { font-size: 14px; text-transform: uppercase; }
                .news-title { font-size: 18px; font-weight: 600; color: #002147; line-height: 1.4; margin-top: 5px; }
                .news-meta { font-size: 13px; color: #777; margin-top: 5px; }

                /* Tabbed Program Grid */
                .program-tabs { border: none !important; margin-bottom: 40px; justify-content: center; }
                .program-tabs .nav-link { border: none !important; color: #002147 !important; font-weight: 600 !important; font-size: 18px !important; padding: 10px 30px !important; position: relative; }
                .program-tabs .nav-link.active { color: #f59e0b !important; background: transparent !important; }
                .program-tabs .nav-link.active::after { content: ""; position: absolute; bottom: 0; left: 30%; width: 40%; height: 3px; background: #f59e0b; }
                .program-card { border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin-bottom: 30px; transition: 0.3s; }
                .program-card:hover { transform: translateY(-5px); }

                /* New News Card Design (High Fidelity) */
                .news-section-title { text-align: center; margin-bottom: 50px; padding-top: 40px; }
                .news-section-title h2 { font-size: 36px; font-weight: 700; color: #333; margin-bottom: 15px; }
                .news-section-title p { color: #888; max-width: 700px; margin: 0 auto; line-height: 1.6; font-size: 16px; }
                
                .news-card { display: flex; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin-bottom: 30px; background: white; transition: 0.3s; border: 1px solid #eee; min-height: 180px; }
                .news-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                
                .news-date-side { min-width: 170px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; padding: 25px; text-align: center; }
                .news-date-day { font-size: 54px; font-weight: 800; line-height: 1; margin-bottom: 8px; }
                .news-date-mon { font-size: 18px; font-weight: 600; text-transform: capitalize; }
                
                .news-info-side { flex: 1; padding: 20px 40px; display: flex; flex-direction: column; justify-content: center; }
                .news-card-title { font-size: 26px; font-weight: 700; color: #1a365d; margin-bottom: 15px; text-decoration: none !important; line-height: 1.3; font-family: 'Playfair Display', serif; }
                .news-card-meta { display: flex; flex-wrap: wrap; gap: 25px; color: #718096; font-size: 15px; }
                .news-card-meta span { display: flex; align-items: center; gap: 8px; }
                .news-card-meta i { color: #4a5568; font-size: 18px; }

                /* Footer Full-Width Fix */
                .footer-full-width { background: #000 !important; width: 100vw; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; padding: 60px 0 20px 0; }
                footer.footer { background: #000 !important; border:none; }
                .footer_top { background: #000 !important; }
                .program-img { height: 200px; background-size: cover; background-position: center; }
                .program-body { padding: 20px; text-align: center; }
                .program-body h4 { font-size: 18px; font-weight: 700; color: #002147; margin-bottom: 15px; min-height: 54px; }
                .apply-btn { background: #002147; color: white !important; padding: 8px 25px; border-radius: 5px; font-weight: 600; }

                /* Logo Wall */
                .logo-wall-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-around; gap: 30px; padding: 40px 0; border-top: 1px solid #eee; }
                .logo-wall-row img { max-height: 60px; filter: grayscale(100%); opacity: 0.6; transition: 0.3s; }
                .logo-wall-row img:hover { filter: grayscale(0%); opacity: 1; transform: scale(1.1); }
            `;
            $("#dynamic-branding-styles").remove();
            $("<style id='dynamic-branding-styles'>").text(dynamicStyles).appendTo("head");
        }

        // --- Navbar Links (with Sub-menus) ---
        if (settings.navbar && settings.navbar.links) {
            let navHtml = "";
            settings.navbar.links.forEach(link => {
                const target = link.is_external ? 'target="_blank"' : '';
                const url = link.is_external ? link.slug : `?colid=${colid}&slug=${link.slug}`;
                
                if (link.sub_links && link.sub_links.length > 0) {
                    navHtml += `<li><a href="${url}" ${target}>${link.label} <i class="ti-angle-down"></i></a>`;
                    navHtml += `<ul class="submenu">`;
                    link.sub_links.forEach(sub => {
                        const subUrl = sub.is_external ? sub.slug : `?colid=${colid}&slug=${sub.slug}`;
                        navHtml += `<li><a href="${subUrl}">${sub.label}</a></li>`;
                    });
                    navHtml += `</ul></li>`;
                } else {
                    navHtml += `<li><a href="${url}" ${target}>${link.label}</a></li>`;
                }
            });
            $("#navigation").html(navHtml);
        }

        // --- Hardcoded Footer for IET-DAVV (colid: 30) ---
        if (colid == "30") {
            const ietFooterHtml = `
                <div class="footer-full-width">
                    <div class="container">
                        <div class="row">
                            <!-- Reach Us -->
                            <div class="col-xl-4 col-md-4" style="border-right: 1px solid #333; padding-right: 40px;">
                                <h3 style="color: #fff; font-weight: 700; margin-bottom: 25px;">Reach Us</h3>
                                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                                    <i class="ti-location-pin" style="color: #fff; font-size: 20px;"></i>
                                    <p style="color: #ccc; font-size: 14px; line-height: 1.6;">Institute of Engineering & Technology, <br> Vikramshila Parisar, <br> Devi Ahilya Vishwavidyalaya <br> Khandwa Road Indore-452017 (M.P.)</p>
                                </div>
                                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                                    <i class="ti-email" style="color: #fff; font-size: 18px;"></i>
                                    <p style="color: #ccc; font-size: 14px;">ao@ietdavv.edu.in</p>
                                </div>
                                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                                    <i class="ti-map-alt" style="color: #fff; font-size: 18px;"></i>
                                    <p style="color: #ccc; font-size: 14px;">Campus Map</p>
                                </div>
                                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                                    <i class="ti-image" style="color: #fff; font-size: 18px;"></i>
                                    <p style="color: #ccc; font-size: 14px;">Photo Gallery</p>
                                </div>
                            </div>
                            
                            <!-- Important Links -->
                            <div class="col-xl-4 col-md-4" style="border-right: 1px solid #333; padding-left: 40px;">
                                <h3 style="color: #fff; font-weight: 500; margin-bottom: 25px;">Important Links</h3>
                                <ul style="list-style: none; padding: 0;">
                                    <li style="margin-bottom: 10px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">Devi Ahilya Vishwavidyalaya</a></li>
                                    <li style="margin-bottom: 10px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">AICTE</a></li>
                                    <li style="margin-bottom: 10px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">Directorate of Technical Education</a></li>
                                    <li style="margin-bottom: 10px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">University Grants Commission</a></li>
                                    <li style="margin-bottom: 10px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">MPOnline</a></li>
                                    <li style="margin-bottom: 10px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">DAVV MPOnline</a></li>
                                    <li style="margin-bottom: 10px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">Digital Initiative by MHRD</a></li>
                                    <li style="margin-bottom: 10px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">Samarth</a></li>
                                    <li style="margin-bottom: 10px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">Mandatory Disclosure</a></li>
                                </ul>
                            </div>

                            <!-- Quick Findings -->
                            <div class="col-xl-4 col-md-4" style="padding-left: 40px;">
                                <h3 style="color: #fff; font-weight: 500; margin-bottom: 25px;">Quick Findings</h3>
                                <ul style="list-style: none; padding: 0;">
                                    <li style="margin-bottom: 8px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">Anti Ragging Committee & Squad</a></li>
                                    <li style="margin-bottom: 8px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">Anti Ragging Cell</a></li>
                                    <li style="margin-bottom: 8px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">TEQIP</a></li>
                                    <li style="margin-bottom: 8px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">Grievance</a></li>
                                    <li style="margin-bottom: 8px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">AICTE Feedback</a></li>
                                    <li style="margin-bottom: 8px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">ICC</a></li>
                                    <li style="margin-bottom: 8px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">Discipline Committee</a></li>
                                    <li style="margin-bottom: 8px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">IPR Cell</a></li>
                                    <li style="margin-bottom: 8px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">Administration</a></li>
                                    <li style="margin-bottom: 8px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">Student Feedback</a></li>
                                    <li style="margin-bottom: 8px;"><a href="#" style="color: #ccc; font-size: 14px; text-decoration: none;">Digital Resources (E-books, Tutorials, MOOCs)</a></li>
                                </ul>
                            </div>
                        </div>

                        <!-- Policy Bar -->
                        <div style="border-top: 1px solid #222; margin-top: 40px; padding-top: 20px; text-align: center;">
                            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin-bottom: 20px;">
                                <a href="#" style="color: #999; font-size: 11px; text-decoration: none;">Copyright Policy</a>
                                <span style="color: #444;">|</span>
                                <a href="#" style="color: #999; font-size: 11px; text-decoration: none;">Hyper Linking Policy</a>
                                <span style="color: #444;">|</span>
                                <a href="#" style="color: #999; font-size: 11px; text-decoration: none;">Terms & Conditions</a>
                                <span style="color: #444;">|</span>
                                <a href="#" style="color: #999; font-size: 11px; text-decoration: none;">Privacy Policy</a>
                                <span style="color: #444;">|</span>
                                <a href="#" style="color: #999; font-size: 11px; text-decoration: none;">Security Policy</a>
                                <span style="color: #444;">|</span>
                                <a href="#" style="color: #999; font-size: 11px; text-decoration: none;">Archival Policy</a>
                                <span style="color: #444;">|</span>
                                <a href="#" style="color: #999; font-size: 11px; text-decoration: none;">Accessibility Statement</a>
                                <span style="color: #444;">|</span>
                                <a href="#" style="color: #999; font-size: 11px; text-decoration: none;">COMA Policy</a>
                                <span style="color: #444;">|</span>
                                <a href="#" style="color: #999; font-size: 11px; text-decoration: none;">Content Review Policy</a>
                                <span style="color: #444;">|</span>
                                <a href="#" style="color: #999; font-size: 11px; text-decoration: none;">Scholar Page</a>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #111; padding-top: 15px;">
                                <p style="color: #666; font-size: 12px; margin: 0;">2026-27 IET-DAVV. All rights reserved.</p>
                                <div style="display: flex; gap: 15px;">
                                    <a href="#" style="color: #fff; width: 32px; height: 32px; background: #3b5998; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none;"><i class="ti-facebook"></i></a>
                                    <a href="#" style="color: #fff; width: 32px; height: 32px; background: #e1306c; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none;"><i class="fa fa-instagram"></i></a>
                                    <a href="#" style="color: #fff; width: 32px; height: 32px; background: #1da1f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none;"><i class="ti-twitter-alt"></i></a>
                                    <a href="#" style="color: #fff; width: 32px; height: 32px; background: #0077b5; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none;"><i class="fa fa-linkedin"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $("#footer-row").html(ietFooterHtml);
            $(".footer .footer_top").css("padding", "0");
            $(".footer .footer_top").css("background", "transparent");
            $(".copy-right_text").hide();
            return;
        } else if (settings.footer) {
            let footerHtml = "";
            const f = settings.footer;

            // 1. Column 1: About / Branding
            footerHtml += `
                <div class="col-xl-4 col-md-6 col-lg-4">
                    <div class="footer_widget">
                        <div class="footer_logo">
                            <h3 style="color:white; margin-bottom: 20px;">${settings.branding?.site_name || ""}</h3>
                        </div>
                        <p>${f.contact_info?.address || "Address not configured."}</p>
                        <div class="socail_links">
                            <ul>
                                ${f.social_links?.facebook ? `<li><a href="${f.social_links.facebook}"><i class="ti-facebook"></i></a></li>` : ''}
                                ${f.social_links?.twitter ? `<li><a href="${f.social_links.twitter}"><i class="ti-twitter-alt"></i></a></li>` : ''}
                                ${f.social_links?.instagram ? `<li><a href="${f.social_links.instagram}"><i class="fa fa-instagram"></i></a></li>` : ''}
                                ${f.social_links?.linkedin ? `<li><a href="${f.social_links.linkedin}"><i class="fa fa-linkedin"></i></a></li>` : ''}
                            </ul>
                        </div>
                    </div>
                </div>
            `;

            // 2. Custom Link Columns
            if (f.columns && f.columns.length > 0) {
                f.columns.forEach(col => {
                    footerHtml += `
                        <div class="col-xl-2 col-md-6 col-lg-2">
                            <div class="footer_widget">
                                <h3 class="footer_title">${col.title}</h3>
                                <ul>
                                    ${col.links.map(link => {
                                        const url = link.is_external ? link.slug : `?colid=${colid}&slug=${link.slug}`;
                                        return `<li><a href="${url}">${link.label}</a></li>`;
                                    }).join('')}
                                </ul>
                            </div>
                        </div>
                    `;
                });
            }

            // 3. Contact Info Column
            footerHtml += `
                <div class="col-xl-3 col-md-6 col-lg-3">
                    <div class="footer_widget">
                        <h3 class="footer_title">Contact Us</h3>
                        <p>${f.contact_info?.address || ""}<br>
                           Phone: ${f.contact_info?.phone || ""}<br>
                           Email: ${f.contact_info?.email || ""}
                        </p>
                    </div>
                </div>
            `;

            $("#footer-row").html(footerHtml);
            $(".copy_right").html(`Copyright &copy; ${new Date().getFullYear()} All rights reserved | ${f.copyright_text || settings.branding?.site_name}`);
        }
    }

    /**
     * Renders all blocks for the page
     */
    function renderPageContent(pageData, settings) {
        $("#cms-content").html(""); // Clear loader
        if (!pageData.blocks || pageData.blocks.length === 0) {
            $("#cms-content").html('<div class="container text-center py-5"><p>This page has no content yet.</p></div>');
            return;
        }
        pageData.blocks.forEach((block, idx) => {
            if (block.is_active) {
                $("#cms-content").append(renderBlock(block, idx, settings));
            }
        });

        // Initialize any dynamic features (sliders, forms, tabs)
        initSliders();
        initForms();
        initTabs();
    }

    function renderBlock(block, idx, settings) {
        const d = block.data;
        switch (block.type) {
            case 'hero':
                const slides = d.slides || [];
                const qActions = d.quickActions || [];
                let sliderHtml = `<div class="slider_area" style="position: relative;">`;
                sliderHtml += `<div class="slider_active owl-carousel">`;
                slides.forEach(slide => {
                    sliderHtml += `
                    <div class="single_slider d-flex align-items-center" style="background-image: linear-gradient(rgba(0, 33, 71, 0.6), rgba(0, 33, 71, 0.3)), url('${slide.imageUrl || 'img/Banners/Image 1.png'}'); background-size: cover; background-position: center center;">
                        <div class="container">
                            <div class="row">
                                <div class="col-xl-12">
                                    <div class="slider_text">
                                        <h3 style="color: white; text-shadow: 2px 2px 10px rgba(0,0,0,0.5); font-weight: 800; font-size: 60px;">${slide.title}</h3>
                                        <p style="color: white; font-size: 22px; margin-bottom: 30px; text-shadow: 1px 1px 5px rgba(0,0,0,0.5); font-weight: 500;">${slide.subtitle || ''}</p>
                                        ${slide.buttonText ? `<a href="${slide.link || '#'}" class="boxed-btn3" style="background: #f59e0b; border-color: #f59e0b; color: #fff;">${slide.buttonText}</a>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                });
                sliderHtml += `</div>`;
                
                // Quick Icons Overlay
                sliderHtml += `<div class="hero-quick-actions d-none d-md-flex">`;
                const icons = ['ti-user', 'ti-briefcase', 'ti-announcement'];
                qActions.forEach((qa, qidx) => {
                    sliderHtml += `
                    <a href="${qa.link || '#'}" class="q-action">
                        <div class="q-circle" style="background: ${qa.color || '#002147'}">
                            <i class="${icons[qidx] || 'ti-link'}"></i>
                        </div>
                        <span class="q-label">${qa.label}</span>
                    </a>`;
                });
                sliderHtml += `</div></div>`;
                return sliderHtml;

            case 'image_text':
                return `
                <div class="about_area section__padding">
                    <div class="container">
                        <div class="row align-items-center">
                            <div class="col-lg-6">
                                <div class="about_img"><img src="${d.imageUrl || 'img/about/about.png'}" alt="" style="width:100%; border-radius: 10px;"></div>
                            </div>
                            <div class="col-lg-6">
                                <div class="about_info">
                                    <h3>${d.heading}</h3>
                                    <div class="rich-text-content">${d.text || ""}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

            case 'sidebar_content':
                const links = d.links || [];
                let sidebarLinksHtml = "";
                links.forEach(link => {
                    const url = link.slug.startsWith('http') ? link.slug : `?colid=${colid}&slug=${link.slug}`;
                    sidebarLinksHtml += `<li><a href="${url}">${link.label}</a></li>`;
                });

                return `
                <div class="sidebar_layout_area section__padding">
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-3">
                                <div class="sidebar-widget">
                                    <div class="sidebar-widget-header">${d.sidebarTitle || "Information"}</div>
                                    <ul class="sidebar-widget-list">
                                        ${sidebarLinksHtml}
                                    </ul>
                                </div>
                            </div>
                            <div class="col-lg-9">
                                <div class="sidebar-content-area rich-text-content">
                                    ${d.content || ""}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

            case 'news_notices':
                const ntTabs = d.tabs || [];
                const justifyStyle = ntTabs.length <= 1 ? 'center' : 'flex-start';
                const borderStyle = ntTabs.length <= 1 ? 'none' : '1px solid #eee';
                let ntHeader = `<ul class="nav nav-tabs program-tabs" id="ntTab" role="tablist" style="justify-content: ${justifyStyle}; margin-bottom: 30px; border-bottom: ${borderStyle};">`;
                let ntContent = `<div class="tab-content" id="ntTabContent">`;
                
                ntTabs.forEach((tab, tIdx) => {
                    const activeClass = tIdx === 0 ? 'active' : '';
                    const tabId = `nt-${idx}-${tIdx}`;
                    
                    ntHeader += `
                        <li class="nav-item" role="presentation">
                            <button class="nav-link ${activeClass}" id="${tabId}-tab" data-bs-toggle="tab" data-bs-target="#${tabId}" type="button" role="tab" style="font-size: 16px; padding: 10px 25px;">${tab.title}</button>
                        </li>`;
                    
                    let itemsHtml = "";
                    (tab.items || []).forEach((item, iIdx) => {
                        const dateObj = new Date(item.date || new Date());
                        const day = dateObj.getDate().toString().padStart(2, '0');
                        const monYear = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
                        const bgColors = ['#1e7bd6', '#ecae23']; // Alternating Blue and Gold
                        const bgColor = bgColors[iIdx % 2];
                        
                        itemsHtml += `
                            <div class="news-card">
                                <div class="news-date-side" style="background: ${bgColor}">
                                    <span class="news-date-day">${day}</span>
                                    <span class="news-date-mon">${monYear}</span>
                                </div>
                                <div class="news-info-side">
                                    <a href="${item.link || '#'}" class="news-card-title">${item.title}</a>
                                    <div class="news-card-meta">
                                        ${item.time ? `<span><i class="ti-time"></i> ${item.time}</span>` : ''}
                                        <span><i class="ti-calendar"></i> ${monYear}</span>
                                        ${item.location ? `<span><i class="ti-location-pin"></i> ${item.location}</span>` : ''}
                                    </div>
                                </div>
                            </div>`;
                    });

                    ntContent += `
                        <div class="tab-pane fade show ${activeClass}" id="${tabId}" role="tabpanel" aria-labelledby="${tabId}-tab">
                            <div class="row justify-content-center">
                                <div class="col-lg-10">
                                    ${itemsHtml || '<p class="text-muted text-center">No items in this category.</p>'}
                                </div>
                            </div>
                        </div>`;
                });

                ntHeader += `</ul>`;
                ntContent += `</div>`;

                return `
                <div class="news_area section-padding">
                    <div class="container">
                        <div class="news-section-title">
                            <h2>Recent News & Announcements</h2>
                            <p>Stay updated with the latest happenings, academic notices, and upcoming events at the Institute of Engineering & Technology.</p>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                ${ntHeader}
                                ${ntContent}
                            </div>
                        </div>
                    </div>
                </div>`;

            case 'tabbed_grid':
                const tabs = d.tabs || [];
                let tabsHeader = `<ul class="nav nav-tabs program-tabs" id="progTab" role="tablist">`;
                let tabsContent = `<div class="tab-content" id="progTabContent">`;
                
                tabs.forEach((tab, tIdx) => {
                    const activeClass = tIdx === 0 ? 'active' : '';
                    const showClass = tIdx === 0 ? 'show active' : '';
                    const tabId = `tab-${idx}-${tIdx}`;
                    
                    tabsHeader += `
                    <li class="nav-item">
                        <a class="nav-link ${activeClass}" id="${tabId}-link" data-bs-toggle="tab" href="#${tabId}" role="tab">${tab.title}</a>
                    </li>`;
                    
                    tabsContent += `<div class="tab-pane fade ${showClass}" id="${tabId}" role="tabpanel">`;
                    tabsContent += `<div class="row">`;
                    (tab.cards || []).forEach(card => {
                        tabsContent += `
                        <div class="col-lg-4 col-md-6">
                            <div class="program-card">
                                <div class="program-img" style="background-image: url('${card.imageUrl || 'img/Program/1.png'}')"></div>
                                <div class="program-body">
                                    <h4>${card.title}</h4>
                                    <a href="?colid=${colid}&slug=${card.slug}" class="apply-btn">APPLY NOW</a>
                                </div>
                            </div>
                        </div>`;
                    });
                    tabsContent += `</div></div>`;
                });
                tabsHeader += `</ul>`;
                tabsContent += `</div>`;

                return `
                <div class="tabbed_program_area section-padding">
                    <div class="container">
                        <div class="row">
                            <div class="col-12 text-center mb-5"><h2 style="color:#002147; font-weight:700;">${d.title || "Programs Offered"}</h2></div>
                            <div class="col-12">
                                ${tabsHeader}
                                ${tabsContent}
                            </div>
                        </div>
                    </div>
                </div>`;

            case 'logo_wall':
                const logos = d.logos || [];
                let logosHtml = `<div class="logo-wall-row">`;
                logos.forEach(logo => {
                    logosHtml += `<a href="${logo.link || '#'}" target="_blank"><img src="${logo.imageUrl || 'img/elements/1.png'}" alt="Recruiter"></a>`;
                });
                logosHtml += `</div>`;
                return `
                <div class="logo_wall_area pb-5">
                    <div class="container">
                        <div class="row text-center mb-5">
                            <div class="col-12">
                                <h2 style="color:#000; font-size: 56px; font-weight:800; text-transform:uppercase; letter-spacing: 3px; margin-bottom: 20px;">${d.title || "RECRUITERS"}</h2>
                                <p style="color:#666; font-size: 20px; font-weight:500; text-transform:uppercase; letter-spacing: 1.5px;">${d.subtitle || "More than 30 Companies Visit IET-DAVV every year"}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                ${logosHtml}
                            </div>
                        </div>
                    </div>
                </div>`;

            case 'rich_text':
                return `
                <div class="rich_text_area section__padding">
                    <div class="container">
                        <div class="row">
                            <div class="col-12">
                                <div class="rich-text-content">
                                    ${d.content || ""}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

            case 'form_block':
                return `
                <div class="contact-form-section section__padding" id="block-${idx}">
                    <div class="container">
                        <div class="row">
                            <div class="col-12"><h2 class="contact-title">${d.title || "Get in Touch"}</h2></div>
                            <div class="col-lg-8">
                                <form class="form-contact cms-dynamic-form" data-form-id="${d.formId}" id="form-${idx}">
                                    <div class="row" id="form-fields-${idx}">
                                        <div class="col-12"><p>Loading form fields...</p></div>
                                    </div>
                                    <div class="form-group mt-3">
                                        <button type="submit" class="button button-contactForm boxed-btn">Send Message</button>
                                    </div>
                                    <div class="form-status mt-3"></div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>`;

            default:
                return `<div class="container py-3"><div class="alert alert-info">Unknown block type: ${block.type}</div></div>`;
        }
    }

    function initSliders() {
        if ($('.slider_active').length) {
            $('.slider_active').owlCarousel({
                loop: true,
                margin: 0,
                items: 1,
                autoplay: true,
                navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
                nav: true,
                dots: false,
                autoplayHoverPause: true,
                autoplaySpeed: 800,
                animateOut: 'fadeOut',
                animateIn: 'fadeIn',
                responsive: {
                    0: { items: 1, nav: false },
                    767: { items: 1, nav: false },
                    992: { items: 1 }
                }
            });
        }
    }

    function initForms() {
        $(".cms-dynamic-form").each(function() {
            const $form = $(this);
            const formId = $form.data("form-id");
            const blockId = $form.attr("id").split("-")[1];
            
            if (!formId) {
                $(`#form-fields-${blockId}`).html('<div class="col-12"><p class="text-danger">No form template selected in CMS.</p></div>');
                return;
            }

            // Fetch Form Definition
            $.ajax({
                url: `${serverUrl}/api/v2/cms/forms/single?colid=${colid}&formId=${formId}`,
                method: "GET",
                success: function(formRes) {
                    if (formRes && formRes.fields) {
                        let fieldsHtml = "";
                        formRes.fields.forEach(field => {
                            const isTextArea = field.type === 'textarea';
                            fieldsHtml += `
                                <div class="${isTextArea ? 'col-12' : 'col-sm-6'}">
                                    <div class="form-group">
                                        ${isTextArea 
                                            ? `<textarea class="form-control" name="${field.label}" cols="30" rows="9" placeholder="Enter ${field.label}"></textarea>`
                                            : `<input class="form-control" name="${field.label}" type="${field.type}" placeholder="Enter ${field.label}">`
                                        }
                                    </div>
                                </div>`;
                        });
                        $(`#form-fields-${blockId}`).html(fieldsHtml);
                    }
                }
            });

            // Handle Submission
            $form.on("submit", function(e) {
                e.preventDefault();
                const $status = $form.find(".form-status");
                $status.html('<p class="text-primary">Submitting...</p>');

                const formData = {};
                $form.serializeArray().forEach(item => {
                    formData[item.name] = item.value;
                });

                $.ajax({
                    url: `${serverUrl}/api/v2/cms/responses?colid=${colid}`,
                    method: "POST",
                    data: JSON.stringify({ formId: formId, data: formData }),
                    contentType: "application/json",
                    success: function() {
                        $status.html('<p class="text-success">Thank you! Your inquiry has been sent.</p>');
                        $form[0].reset();
                    },
                    error: function() {
                        $status.html('<p class="text-danger">Failed to send inquiry. Please try again later.</p>');
                    }
                });
            });
        });
    }

    function initTabs() {
        // Bootstrap 5 uses data-bs-toggle, but some older themes use data-toggle
        // We ensure clicks on tab links trigger the right pane visibility
        $('[data-bs-toggle="tab"], [data-toggle="tab"]').on('click', function(e) {
            e.preventDefault();
            $(this).tab('show');
        });
    }
});
