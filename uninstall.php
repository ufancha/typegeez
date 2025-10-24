<?php
// If uninstall not called from WordPress, exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// This plugin does not store options or custom tables.
// Nothing to clean up on uninstall at this time.
