
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export { colors, spacing, typography };

export const appStyles = {
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        
    },

    backButton: {
        backgroundColor: '#f0f4f8',
        padding: 8,
        borderRadius: 50,
    },
    
    headerTitleText: {
        flex: 1,
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 16,
        marginRight: 40,
        color: colors.brandBlue,
    },

    row: {
        
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },

    halfButtonPrimary: {
        flex: 1,
        backgroundColor: colors.primary,
        
        padding: 14,
        borderRadius: 30,
        alignItems: 'center',
        
    },

    

    halfButtonSecondary: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
        padding: 14,
        borderRadius: 30,
        alignItems: 'center',
    },

    halfButtonPrimaryText: {
        color: colors.white,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
    },

    halfButtonSecondaryText: {
        color: colors.primary,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
    },

    fullButtonPrimary: {
        width: '100%',
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
    },
    fullButtonSecondary: {
        width: '100%',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    logo: {
        width: 45,
        height: 45
    },
    logoContainer: { alignItems: "center", marginBottom: 45 },
    logoWrapper: {
        width: 80,
        height: 80,
        backgroundColor: colors.bgGray,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[5],
        borderWidth: 1,
        borderColor: colors.bgMuted
    },
    

    notificationBadge: {
        position: "absolute",
        top: -2,
        right: -1,
        backgroundColor: "#EF4444",
        borderWidth: 1,
        borderColor: "#fff",
        width: 8,
        height: 8,
        borderRadius: 999,
    
        
    },

    notificationBadgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
    },
    containerWhite: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    containerGray: {
        flex: 1,
        backgroundColor: colors.bgGray,
    },
    authScroll: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    authContent: {
        paddingHorizontal: 30,
        paddingVertical: spacing[10],
    },
    contentCompact: {
        paddingHorizontal: 24,
        paddingVertical: spacing[6],
    },
    
    subHeaderText: {
        fontSize: 15,
        color: colors.textMuted,
        lineHeight: 22,
    },
    line: { 
        flex: 1, 
        height: 1, 
        backgroundColor: '#E2E8F0' 
    },
    formSection: {
        flex: 1,
    },
    footerRowCentered: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing[10],
        paddingBottom: spacing[5],
    },
    
    authTitle: {
        ...typography.textStyles.h1,
        color: colors.text,
        letterSpacing: -0.5,
    },
    authSubtitle: {
        fontSize: typography.fontSize.md + 1,
        color: colors.textMuted,
        marginTop: spacing[1] + 2,
    },
    scrollContent: { padding: 24, flexGrow: 1 },
    screenHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: colors.bg,
        paddingBottom: 15,
    },
    
    
    screenContent: {
        padding: 24,
        flex: 1,
    },
    sectionSpacing: {
        marginBottom: 32,
    },
    footerPadding: {
        paddingHorizontal: 24,
    },
    pinInput: {
        backgroundColor: colors.bgMuted,
        borderRadius: 12,
        padding: 16,
        fontSize: 24,
        fontWeight: typography.fontWeight.bold,
        letterSpacing: 10,
        color: colors.textBody,
        width: 120,
        textAlign: 'center',
    },
    roundButton: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 100,
        alignItems: 'center',
    },
    roundButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
    },
    switcherWrap: {
        paddingHorizontal: 24,
        paddingTop: 18,
        paddingBottom: 8,
    },
    switcherLabel: {
        fontSize: 14,
        fontWeight: typography.fontWeight.bold,

        letterSpacing: 0.4,

        marginBottom: 10,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#EEF2F6',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 4,
        gap: 4,
    },
    segmentedTab: {
        flex: 1,
        minHeight: 64,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'flex-start',
        justifyContent: 'center',
        borderRadius: 14,
    },
    segmentedTabActive: {
        backgroundColor: colors.primary,
        elevation: 3,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 10,
    },
    segmentedEyebrow: {
        fontSize: 11,
        fontWeight: typography.fontWeight.medium,
        color: colors.textMuted,
        marginBottom: 4,
    },
    segmentedEyebrowActive: {
        color: 'rgba(255,255,255,0.72)',
    },
    segmentedText: {
        fontSize: typography.fontSize.md,
        color: colors.text,
        fontWeight: typography.fontWeight.bold,
    },
    segmentedTextActive: {
        color: colors.white,
    },
    segmentedTabPricingMode: {
        minHeight: 52,
        paddingVertical: 8,
        alignItems: 'center',
    },
    segmentedTextCentered: {
        textAlign: 'center',
    },
    segmentedTextSubtle: {
        fontWeight: typography.fontWeight.medium,
        color: '#64748B',
    },
    segmentedTextSubtleActive: {
        color: 'rgba(255,255,255,0.82)',
    },
    otpScreenContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    otpHeaderBlock: {
        marginBottom: 40,
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    otpInputBox: {
        width: 48,
        height: 60,
        borderWidth: 1.5,
        borderColor: colors.bgMuted,
        borderRadius: 14,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: typography.fontWeight.bold,
        backgroundColor: colors.bgGray,
        color: colors.text,
    },
    otpInputBoxActive: {
        borderColor: colors.primary,
        backgroundColor: colors.bg,
        elevation: 2,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    otpFooterRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    otpResendText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
    },
    summaryScrollContent: {
        padding: 20,
    },
    orderDetailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF2F6',
        backgroundColor: colors.bg,
    },
    
    orderDetailsScroll: {
        padding: 16,
        paddingBottom: 28,
    },
    summaryTitle: {
        fontSize: 24,
        fontWeight: typography.fontWeight.bold,
        color: colors.textBody,
    },
    summarySubtitle: {
        color: colors.textMuted,
        marginTop: 8,
        marginBottom: 25,
        lineHeight: 20,
    },

    
    summaryCard: {
        
        backgroundColor: colors.bg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    summaryLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryMapIconWrap: {
        width: 50,
        height: 50,
        backgroundColor: '#eef2f6',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    summaryLocationTextWrap: {
        flex: 1,
        justifyContent: 'center',
    },
    summaryLocationName: {
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.md,
        marginBottom: 4,
        color: colors.textBody,
    },
    summaryAddressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryAddressText: {
        color: '#757575',
        fontSize: typography.fontSize.sm,
        marginLeft: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 8,
    },
    summaryRowLabel: {
        fontSize: 14,
        color: '#667085',
        flex: 1,
    },
   
    summaryRowValue: {
        fontSize: 14,
        color: '#101828',
        fontWeight: '600',
        flex: 1,
        flexShrink: 1,
        textAlign: 'right',
    },
    summaryCardHeader: {
        fontWeight: typography.fontWeight.bold,
        fontSize: 15,
        marginBottom: 10,
        color: colors.textBody,
    },
   
    summaryTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    summaryTotalLabel: {
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.md,
        color: colors.textBody,
    },
    summaryTotalValue: {
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.md,
        color: colors.textBody,
    },
    submitButtonRounded: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: colors.white,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.md,
    },
    
    tabSectionTight: {
        paddingBottom: 8,
    },
    segmentedControlWithSpacing: {
        marginBottom: 16,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    notesTextArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    uploadSection: {
        marginTop: 6,
        marginBottom: 6,
    },
    requiredStar: {
        color: '#E11D48',
    },
    uploadCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 28,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    uploadIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EFF3F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    uploadTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
        marginBottom: 8,
    },
    uploadHint: {
        fontSize: typography.fontSize.xs,
        color: '#667085',
        textAlign: 'center',
    },
    submitButtonBottomSpace: {
        marginTop: 10,
        marginBottom: 30,
    },
    pageHeaderBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF2F6',
    },
    circleIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageHeaderTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    pageHeaderSpacer: {
        width: 40,
    },
    pageContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 18,
        
        
    },
    
    
    chipRow: {
        paddingBottom: 10,
        gap: 10,
        
        flexDirection: 'row',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: '#f9f2f1',
    },
    chipActive: {
        backgroundColor: '#E0E7FF',
    },
    chipText: {
        fontSize: 13,
        fontWeight: typography.fontWeight.bold,
        color: colors.textMuted,
    },
    chipTextActive: {
        color: colors.primary,
    },
    formPageContent: {
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: colors.bg,
    },
    avatarCameraBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.bg,
    },
    formCard: {
        backgroundColor: colors.bg,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    formCardTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.extrabold,
        color: '#1D2939',
        marginBottom: 10,
    },
    
    formInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 55,
        marginBottom: 20,
    },
    formInputText: {
        flex: 1,
        height: '100%',
        color: '#000000',
    },
    simpleInputGroup: {
        marginBottom: 15,
    },
    simpleInput: {
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#344054',
    },
    stickyFooter: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: 20,
        backgroundColor: colors.bg,
        paddingTop: 15,
    },
    pillPrimaryButton: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 50,
        alignItems: 'center',
    },
    pillPrimaryButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
    },
    errorTextTight: {
        color: colors.danger,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        marginTop: -15,
        marginLeft: 5,
    },
    addInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 12,
        padding: 14,
        gap: 10,
    },
    addInputText: {
        color: '#667085',
        fontSize: 15,
    },
    stackedList: {
        gap: 12,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg,
        borderRadius: 16,
        padding: 12,
    },
    locationThumb: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#E4E7EC',
    },
    locationContent: {
        flex: 1,
        marginLeft: 12,
        gap: 4,
    },
    locationTitle: {
        fontSize: 15,
        fontWeight: typography.fontWeight.bold,
        color: '#1D2939',
    },
    locationMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationMetaText: {
        fontSize: 13,
        color: '#667085',
        flex: 1,
    },
    destructiveIconButton: {
        backgroundColor: '#FFF1F0',
        padding: 10,
        borderRadius: 50,
    },
    settingsSectionCard: {
        backgroundColor: colors.bg,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    settingsIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F2F4F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingsLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: typography.fontWeight.medium,
        color: '#344054',
    },
    divider: {
        height: 1,
        backgroundColor: '#F2F4F7',
        marginBottom: 15,
    },
    homeContainer: {
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: 10,
    },
    homeHeaderWrap: {
        paddingHorizontal: 16,
        backgroundColor: colors.bg,
        zIndex: 1,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 30,
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    homeNameText: {
        color: '#000',
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
    homeIconButton: {
        backgroundColor: 'rgb(236, 236, 236)',
        padding: 8,
        borderRadius: 50,
    },
    homeScrollContent: {
        paddingBottom: 12,
    },
    homeContent: {
        paddingHorizontal: 16,
        
    },
    walletCard: {
        backgroundColor: colors.primary,
        borderRadius: 18,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    walletBalanceInfo: {
        flex: 1,
    },
    walletLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    walletLabelText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
    walletBalanceText: {
        color: colors.white,
        fontSize: 24,
        fontWeight: typography.fontWeight.bold,
        marginTop: 8,
    },
    walletActions: {
        alignItems: 'flex-end',
        gap: 12,
    },
    walletHistoryLink: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.5)',
        paddingBottom: 2,
    },
    walletHistoryText: {
        color: colors.white,
        fontSize: 11,
        marginRight: 4,
    },
    walletTopUpButton: {
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    walletTopUpText: {
        color: colors.primary,
        fontWeight: typography.fontWeight.bold,
        marginLeft: 6,
        fontSize: typography.fontSize.sm,
    },
    homeActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'space-around',
        marginTop: 15,
    },
    homePrimaryActionButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        width: '48%',
        justifyContent: 'center',
    },
    homePrimaryActionText: {
        color: colors.white,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
    homeSecondaryActionButton: {
        backgroundColor: colors.white,
        borderColor: colors.primary,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        width: '48%',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: colors.primary,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
    homeProductSection: {
        paddingHorizontal: 16,
        marginTop: 20,
        marginBottom: 16,
    },
    homeProductHeading: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        marginBottom: 15,
        color: colors.primary,
    },
    homeLoadMoreText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    homeLoadMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        gap: 6,
        marginTop: 10,
        marginBottom: 40,
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderRadius: 999,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D0D5DD',
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1,
    },
    homeLoadMoreIcon: {
        marginTop: 1,
    },
    headerSection: {
        marginBottom: spacing[5],
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
        marginTop: 5,
        lineHeight: 20,
    },
    walletSectionHeader: {
        marginTop: 24,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    walletSectionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
    },
    searchInputContainer: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginBottom: 8,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 48,
        paddingHorizontal: 12,
    },
    searchBox: {
        flex: 1,
        paddingHorizontal: 8,
        height: '100%',
        fontSize: typography.fontSize.sm,
        color: '#1E293B',
    },
    filterButton: {
        backgroundColor: colors.primary,
        height: 48,
        width: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletListContent: {
       
        paddingBottom: 100,
    },
    walletTransactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    walletTransactionIconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletTransactionMain: {
        flex: 1,
        marginLeft: 12,
    },
    walletTransactionTitle: {
        fontWeight: '600',
        color: '#1E293B',
        fontSize: 14,
        marginBottom: 4,

        
    },
    walletTransactionDate: {
        color: colors.textMuted,
        fontSize: 11,
    },
    walletTransactionRight: {
        alignItems: 'flex-end',
        marginLeft: 8,
    },
    walletTransactionAmount: {
        fontWeight: '700',
        fontSize: 14,
        marginBottom: 4,
    },
    walletStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    walletStatusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    cardTopupContainer: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    cardTopupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    cardTopupBackButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    cardTopupScroll: {
        padding: 20,
    },
    cardTopupInputGroup: {
        marginBottom: 20,
    },
    cardTopupFormCard: {
        backgroundColor: colors.bg,
        borderRadius: 20,
        padding: 20,
        marginTop: 20,
        elevation: 1,
    },
    cardTopupLabel: {
        fontSize: 13,
        fontWeight: typography.fontWeight.medium,
        color: '#64748B',
        marginBottom: 8,
    },
    cardTopupInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 55,
        marginBottom: 20,
    },
    cardTopupCurrency: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        marginRight: 5,
        color: '#1E293B',
    },
    cardTopupInput: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
    },
    cardTopupRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardTopupFooter: {
        padding: 20,
        backgroundColor: colors.bg,
    },
    cardTopupContinueBtn: {
        backgroundColor: colors.primary,
        height: 55,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTopupContinueBtnDisabled: {
        opacity: 0.7,
    },
    cardTopupContinueText: {
        color: colors.white,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.md,
    },
    ordersHeader: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        backgroundColor: colors.bg,
    },
    
    ordersFilterRow: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 10,
        gap: 12,
    },
    ordersFilterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F2F4F7',
        borderRadius: 24,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    ordersFilterChipActive: {
        backgroundColor: '#E7ECF4',
    },
    ordersFilterCount: {
        minWidth: 34,
        height: 30,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        backgroundColor: '#EAECF0',
    },
    ordersFilterCountActive: {
        backgroundColor: '#D6E4FF',
    },
    ordersList: {
        paddingHorizontal: 18,
        paddingTop: 8,
        gap: 8,
    },
    ordersCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.bg,
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: '#F2F4F7',
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 18,
        elevation: 1,
    },
    ordersCardLeft: {
        flex: 1,
        paddingRight: 12,
    },
    ordersTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: '#101828',
        marginBottom: 10,
    },
    ordersLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ordersLocationText: {
        marginLeft: 6,
        fontSize: typography.fontSize.sm,
        color: '#667085',
    },
    ordersCardRight: {
        alignItems: 'flex-end',
        gap: 12,
    },
    ordersStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    ordersStatusBadgeActive: {
        backgroundColor: '#E8FFF3',
    },
    ordersStatusBadgePending: {
        backgroundColor: '#FFF4E5',
    },
    ordersStatusBadgeCompleted: {
        backgroundColor: '#EAF2FF',
    },
    ordersStatusText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
    ordersStatusTextActive: {
        color: '#12B76A',
    },
    ordersStatusTextPending: {
        color: '#B54708',
    },
    ordersStatusTextCompleted: {
        color: colors.primary,
    },
    ordersAmount: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.extrabold,
        color: '#101828',
    },
    ordersEmptyState: {
        backgroundColor: colors.bg,
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F2F4F7',
    },
    ordersEmptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: '#101828',
        marginBottom: 8,
    },
    ordersEmptyText: {
        fontSize: typography.fontSize.sm,
        lineHeight: 21,
        color: '#667085',
        textAlign: 'center',
    },
    ordersFab: {
        position: 'absolute',
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        paddingHorizontal: 20,
    },

    
    
    profileHeroCard: {
        backgroundColor: colors.primary,
        padding: 20,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        elevation: 4,
        shadowColor: colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    
    profileName: {
        color: colors.white,
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
    },
    profileEmail: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: typography.fontSize.sm,
        marginTop: 2,
    },
    profileChevronBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: 12,
    },
    profileMenuCard: {
        backgroundColor: colors.bg,
        borderRadius: 20,
        paddingVertical: 5,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    profileMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        justifyContent: 'space-between',
    },
    profileMenuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileMenuText: {
        flex: 1,
        marginLeft: 15,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        color: '#1E293B',
    },
    profileLogoutButton: {
        flexDirection: 'row',
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        marginTop: 10,
    },
    profileLogoutText: {
        color: '#E53E3E',
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.md,
    },
    profileVersionText: {
        textAlign: 'center',
        marginTop: 25,
        color: '#94A3B8',
        fontSize: typography.fontSize.sm,
    },
    formLabel: {
        ...typography.textStyles.label,
        color: colors.textBody,
        marginBottom: spacing[2],
    },
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 25
    },

    forgotWrapper: { alignItems: 'flex-end', marginTop: -10 },
    inputWrapper: { marginBottom: spacing[5] },

    pickupLocationTile: {
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#D0D5DD",
        borderRadius: 10,
        backgroundColor: "#F2F4F7",
        justifyContent: "center",
        flexDirection: 'row',
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 14,
        marginBottom: 12
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ece7d9',
        borderRadius: 12,
        height: 50,
        backgroundColor: '#fcfdfe',
        paddingHorizontal: 8,
        
    },

    inputText: {
        flex: 1,

        fontSize: typography.fontSize.md + 1,
        color: colors.text,
        fontWeight: typography.fontWeight.medium,
    },
    inputIcon: { marginRight: spacing[3] },
    inputError: {
        borderColor: colors.danger,
    },
    inputFocused: {
        borderColor: '#0B4A8B',
        borderWidth: 1,
        shadowColor: '#2563eb',
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: spacing[4],
        alignItems: 'center',
        marginTop: 30,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: spacing[1] },
        shadowOpacity: 0.2,
        shadowRadius: spacing[2],
        elevation: spacing[1],
    },
    primaryButtonText: {
        color: colors.white,
        fontWeight: typography.fontWeight.extrabold,
        fontSize: typography.fontSize.lg,
    },
    primaryButtonSpaced: {
        marginTop: 24,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.7
    },
    helperText: {
        color: colors.textMuted,
        fontSize: typography.fontSize.md,
    },
    linkText: {
        color: colors.primary,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.md,
    },

    errorContainer: {
        backgroundColor: '#FEF2F2', // pale red
        borderWidth: 1,
        borderColor: '#EF4444', // red border
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 8,
    },
    errorText: {
        color: colors.danger,
        fontSize: typography.fontSize.sm,
        marginVertical: spacing[1] + 2,
        marginLeft: spacing[1],
        fontWeight: typography.fontWeight.medium,
    },
} as const;

export const profileMenuItems = [
  
    { icon: "notifications-outline", title: "Notifications", route: "/notifications" },
    { icon: "lock-closed-outline", title: "Security", route: "/security" },
    
    { icon: "document-text-outline", title: "Terms & Conditions", route: "/home" },
    { icon: "shield-checkmark-outline", title: "Privacy Policy", route: "/home" },
    { icon: "star-outline", title: "Rate Our App", route: "/home" },
    { icon: "information-circle-outline", title: "About Charissatics", url: "https://charissatics.com/about-us/" },
];

export default profileMenuItems;

export const slides = [
    {
        title: "Order Materials and Truck Services",
        description: "Select sand, granite, and truck services in a few simple steps.",
        image: require("../assets/images/onboarding1.png"),
    },
    {
        title: "Track Orders in Real Time",
        description: "Monitor your delivery and know exactly when it arrives.",
        image: require("../assets/images/onboarding2.png"),
    },
    {
        title: "Reliable Material Supply",
        description: "Get building materials delivered quickly and reliably.",
        image: require("../assets/images/onboarding3.png"),
    },
];
